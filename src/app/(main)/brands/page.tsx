"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/shared/components/ui/button"
import { Brand } from "@/src/utils/types/brand"
import { useBrandsApi } from "./shared/useBrands.api"
import { confirmAlert } from "@/src/lib/alerts"
import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Spinner } from "@/src/shared/components/spinner"
import { Modal } from "@/src/shared/components/modal"
import { BrandForm } from "./forms/brand-form"
import { toast } from "sonner"

export default function BrandsPage() {
  const { getBrands, createBrand: apiCreateBrand, updateBrand: apiUpdateBrand, deleteBrand: apiDeleteBrand } = useBrandsApi()

  // Data State
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])

  // Loading State
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [interactionLoading, setInteractionLoading] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)

  // Modals & Forms State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false)
  const [brandFormData, setBrandFormData] = useState<Partial<Brand>>({})

  // ================= LOAD =================

  const loadBrands = async () => {
    setLoadingBrands(true)
    try {
      const data = await getBrands()
      setBrands(data)
      setFilteredBrands(data)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoadingBrands(false)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [])

  // ================= FILTER =================

  const handleBrandSearch = (query: string) => {
    const filtered = brands.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
    setFilteredBrands(filtered)
  }

  // ================= HANDLERS: BRANDS =================

  const openCreateBrand = () => {
    setBrandFormData({})
    setIsBrandModalOpen(true)
  }

  const openEditBrand = (brand: Brand) => {
    setBrandFormData(brand)
    setIsEditBrandOpen(true)
  }

  const handleCreateBrand = async () => {
    if (!brandFormData.name?.trim()) return
    setInteractionLoading(true)
    try {
      await apiCreateBrand(brandFormData.name)
      toast.success("Marque ajoutée")
      setIsBrandModalOpen(false)
      loadBrands()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setInteractionLoading(false)
    }
  }

  const handleUpdateBrand = async () => {
    if (!brandFormData.id || !brandFormData.name?.trim()) return
    setInteractionLoading(true)
    try {
      await apiUpdateBrand(brandFormData.id, brandFormData.name)
      toast.success("Marque modifiée")
      setIsEditBrandOpen(false)
      loadBrands()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setInteractionLoading(false)
    }
  }

  const handleDeleteBrand = async (brand: Brand) => {
    const confirmed = await confirmAlert("Supprimer la marque", `Voulez-vous vraiment supprimer ${brand.name} ?`)
    if (!confirmed) return

    setIdToDelete(brand.id)
    setInteractionLoading(true)
    try {
      await apiDeleteBrand(brand.id)
      toast.success("Marque supprimée")
      loadBrands()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setInteractionLoading(false)
      setIdToDelete(null)
    }
  }

  // ================= COLUMNS =================

  const brandColumnsRaw: ColumnDef<Brand>[] = [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openEditBrand(row.original) }}>Modifier</Button>
          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteBrand(row.original) }} disabled={interactionLoading && idToDelete === row.original.id}>
            {interactionLoading && idToDelete === row.original.id ? <Spinner className="size-4" /> : "Supprimer"}
          </Button>
        </div>
      )
    }
  ]

  const brandColumns = createColumns({ columns: brandColumnsRaw })

  // ================= UI =================
  return (
    <div className="space-y-10 p-10">

      {/* ===== MARQUES ===== */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">Gestion des Marques</h2>
          <Button onClick={openCreateBrand}>Ajouter une marque</Button>
        </div>

        {loadingBrands ? (
          <div className="flex justify-center p-10"><Spinner /></div>
        ) : (
          <DataTable
            data={filteredBrands}
            columnsProps={brandColumns}
            handleSearch={handleBrandSearch}
            title="Liste des marques"
          />
        )}
      </div>

      {/* ===== MODALS BRANDS ===== */}
      <Modal open={isBrandModalOpen} modalTitle="Nouvelle marque" onClose={() => setIsBrandModalOpen(false)}>
        <BrandForm
          mode="create"
          data={brandFormData}
          loading={interactionLoading}
          onChange={setBrandFormData}
          onClose={() => setIsBrandModalOpen(false)}
          onSubmit={handleCreateBrand}
        />
      </Modal>

      <Modal open={isEditBrandOpen} modalTitle="Modifier marque" onClose={() => setIsEditBrandOpen(false)}>
        <BrandForm
          mode="edit"
          data={brandFormData}
          loading={interactionLoading}
          onChange={setBrandFormData}
          onClose={() => setIsEditBrandOpen(false)}
          onSubmit={handleUpdateBrand}
        />
      </Modal>
    </div>
  )
}
