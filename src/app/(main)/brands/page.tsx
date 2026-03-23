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
      const newBrand = await apiCreateBrand(brandFormData.name)

      toast.success("Marque ajoutée")

      // 🔥 UPDATE LOCAL
      setBrands((prev) => [...prev, newBrand])
      setFilteredBrands((prev) => [...prev, newBrand])

      setIsBrandModalOpen(false)

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
    const updatedBrand = await apiUpdateBrand(
      brandFormData.id,
      brandFormData.name
    )

    toast.success("Marque modifiée")

    // 🔥 UPDATE LOCAL
    setBrands((prev) =>
      prev.map((b) =>
        b.id === updatedBrand.id ? updatedBrand : b
      )
    )

    setFilteredBrands((prev) =>
      prev.map((b) =>
        b.id === updatedBrand.id ? updatedBrand : b
      )
    )

    setIsEditBrandOpen(false)

  } catch (e: any) {
    toast.error(e.message)
  } finally {
    setInteractionLoading(false)
  }
}

  const handleDeleteBrand = async (brand: Brand) => {
  const confirmed = await confirmAlert(
    "Supprimer la marque",
    `Voulez-vous vraiment supprimer ${brand.name} ?`
  )
  if (!confirmed) return

  setIdToDelete(brand.id)
  setInteractionLoading(true)

  try {
    await apiDeleteBrand(brand.id)

    toast.success("Marque supprimée")

    // 🔥 UPDATE LOCAL
    setBrands((prev) => prev.filter((b) => b.id !== brand.id))
    setFilteredBrands((prev) => prev.filter((b) => b.id !== brand.id))

  } catch (e: any) {
    toast.error(e?.message || "Erreur lors de la suppression")
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
        <div className="flex gap-2 ">
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); openEditBrand(row.original) }}>Modifier</Button>
          <Button variant="destructive" onClick={(e) => { e.stopPropagation(); handleDeleteBrand(row.original) }} disabled={interactionLoading && idToDelete === row.original.id}>
            {interactionLoading && idToDelete === row.original.id ? <Spinner className="size-4" /> : "Supprimer"}
          </Button>
        </div>
      )
    }
  ]

  const brandColumns = createColumns({ columns: brandColumnsRaw })

  // ================= UI =================
  return (
  <div className="h-full py-4 px-12 bg-zinc-50">
    <div className="bg-white min-h-full rounded-lg p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Marques</h1>
        <Button onClick={openCreateBrand}>
          Ajouter une marque
        </Button>
      </div>

      {/* TABLEAU */}
      {loadingBrands ? (
        <div className="flex justify-center p-12">
          <Spinner />
        </div>
      ) : (
        <DataTable
          data={filteredBrands}
          columnsProps={brandColumns}
          handleSearch={handleBrandSearch}
          title="Liste des marques"
        />
      )}

      {/* ===== MODAL CREATION MARQUE ===== */}
      <Modal
        open={isBrandModalOpen}
        modalTitle="Nouvelle marque"
        onClose={() => setIsBrandModalOpen(false)}
      >
        <BrandForm
          mode="create"
          data={brandFormData}
          loading={interactionLoading}
          onChange={setBrandFormData}
          onClose={() => setIsBrandModalOpen(false)}
          onSubmit={handleCreateBrand}
        />
      </Modal>

      {/* ===== MODAL EDIT MARQUE ===== */}
      <Modal
        open={isEditBrandOpen}
        modalTitle="Modifier marque"
        onClose={() => setIsEditBrandOpen(false)}
      >
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
  </div>
)
}
