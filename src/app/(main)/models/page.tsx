"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/shared/components/ui/button"
import { Brand } from "@/src/utils/types/brand"
import { Model } from "@/src/utils/types/model"
import { useBrandsApi } from "../brands/shared/useBrands.api"
import { useModelsApi } from "../brands/shared/useModels.api"
import { confirmAlert } from "@/src/lib/alerts"
import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Spinner } from "@/src/shared/components/spinner"
import { Modal } from "@/src/shared/components/modal"
import { ModelForm } from "../brands/forms/model-form"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"
import { Label } from "@/src/shared/components/ui/label"
import { Badge } from "@/src/shared/components/ui/badge"

export default function ModelsPage() {
    const { getBrands } = useBrandsApi()
    const { getModels, createModel: apiCreateModel, updateModel: apiUpdateModel, deleteModel: apiDeleteModel } = useModelsApi()

    // Data State
    const [brands, setBrands] = useState<Brand[]>([])
    const [models, setModels] = useState<Model[]>([])
    const [filteredModels, setFilteredModels] = useState<Model[]>([])

    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)

    // Loading State
    const [loadingModels, setLoadingModels] = useState(false)
    const [interactionLoading, setInteractionLoading] = useState(false)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    // Modals & Forms State
    const [isModelModalOpen, setIsModelModalOpen] = useState(false)
    const [isEditModelOpen, setIsEditModelOpen] = useState(false)
    const [modelFormData, setModelFormData] = useState<Partial<Model>>({})

    // ================= LOAD =================

    const loadBrands = async () => {
        try {
            const data = await getBrands()
            setBrands(data)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const loadModels = async (brandId: string) => {
        setLoadingModels(true)
        try {
            const data = await getModels(brandId)
            setModels(data)
            setFilteredModels(data)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoadingModels(false)
        }
    }

    useEffect(() => {
        loadBrands()
    }, [])

    useEffect(() => {
        if (selectedBrandId) {
            loadModels(selectedBrandId)
        } else {
            setModels([])
            setFilteredModels([])
        }
    }, [selectedBrandId])

    // ================= FILTER =================

    const handleModelSearch = (query: string) => {
        const filtered = models.filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
        setFilteredModels(filtered)
    }

    // ================= HANDLERS: MODELS =================

    const openCreateModel = () => {
        if (!selectedBrandId) {
            toast.error("Veuillez sélectionner une marque d'abord")
            return
        }
        setModelFormData({ brandId: selectedBrandId })
        setIsModelModalOpen(true)
    }

    const openEditModel = (model: Model) => {
        setModelFormData(model)
        setIsEditModelOpen(true)
    }

    const handleCreateModel = async () => {
        if (!modelFormData.name?.trim() || !modelFormData.brandId) return
        setInteractionLoading(true)
        try {
            await apiCreateModel(modelFormData.name, modelFormData.brandId)
            toast.success("Modèle ajouté")
            setIsModelModalOpen(false)
            loadModels(modelFormData.brandId)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setInteractionLoading(false)
        }
    }

    const handleUpdateModel = async () => {
        if (!modelFormData.id || !modelFormData.name?.trim()) return
        setInteractionLoading(true)
        try {
            await apiUpdateModel(modelFormData.id, modelFormData.name)
            toast.success("Modèle modifié")
            setIsEditModelOpen(false)
            if (modelFormData.brandId) loadModels(modelFormData.brandId)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setInteractionLoading(false)
        }
    }

    const handleDeleteModel = async (model: Model) => {
        const confirmed = await confirmAlert("Supprimer le modèle", `Voulez-vous vraiment supprimer ${model.name} ?`)
        if (!confirmed) return

        setIdToDelete(model.id)
        setInteractionLoading(true)
        try {
            await apiDeleteModel(model.id)
            toast.success("Modèle supprimé")
            if (selectedBrandId) loadModels(selectedBrandId)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setInteractionLoading(false)
            setIdToDelete(null)
        }
    }


    // ================= COLUMNS =================

    const modelColumnsRaw: ColumnDef<Model>[] = [
        {
            accessorKey: "name",
            header: "Nom",
        },
        {
            header: "Marque",
            cell: ({ row }) => {
                const brand = brands.find(b => b.id === row.original.brandId)
                return <Badge variant="secondary">{brand ? brand.name : "..."}</Badge>
            }
        },
        {
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2 justify-start">
                    <Button variant="outline" onClick={() => openEditModel(row.original)}>Modifier</Button>
                    <Button variant="destructive" onClick={() => handleDeleteModel(row.original)} disabled={interactionLoading && idToDelete === row.original.id}>
                        {interactionLoading && idToDelete === row.original.id ? <Spinner className="size-4" /> : "Supprimer"}
                    </Button>
                </div>
            )
        }
    ]

    const modelColumns = createColumns({ columns: modelColumnsRaw })


    // ================= UI =================

   return (
  <div className="h-full py-4 px-12 bg-zinc-50">
    <div className="bg-white min-h-full rounded-lg p-6 space-y-8">

      {/* HEADER */}
      <h1 className="font-bold text-2xl">Gestion des Modèles</h1>

      {/* CONTENU */}
      <div className="space-y-6">

        {/* FILTRE + ACTION */}
        <div className="flex items-end gap-4 border p-4 rounded-lg bg-muted/20">
          
          <div className="w-full max-w-xs space-y-2">
            <Label>Filtrer par marque</Label>
            <Select
              value={selectedBrandId || ""}
              onValueChange={(val) => setSelectedBrandId(val)}
            >
              <SelectTrigger className="w-full bg-white h-11">
                <SelectValue placeholder="Choisir une marque..." />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBrandId && (
            <Button
              size="lg"
              onClick={openCreateModel}
              className="ml-auto"
            >
              Ajouter un modèle
            </Button>
          )}

        </div>

        {/* CONTENU PRINCIPAL */}
        {!selectedBrandId ? (
          <div className="text-center p-12 border border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              Veuillez sélectionner une marque pour voir ses modèles
            </p>
          </div>
        ) : loadingModels ? (
          <div className="flex justify-center p-12">
            <Spinner />
          </div>
        ) : (
          <DataTable
            data={filteredModels}
            columnsProps={modelColumns}
            handleSearch={handleModelSearch}
            title={`Modèles - ${
              brands.find((b) => b.id === selectedBrandId)?.name
            }`}
          />
        )}

      </div>

      {/* ===== MODAL CREATION MODELE ===== */}
      <Modal
        open={isModelModalOpen}
        modalTitle="Nouveau modèle"
        onClose={() => setIsModelModalOpen(false)}
      >
        <ModelForm
          mode="create"
          data={modelFormData}
          brands={brands}
          loading={interactionLoading}
          onChange={setModelFormData}
          onClose={() => setIsModelModalOpen(false)}
          onSubmit={handleCreateModel}
        />
      </Modal>

      {/* ===== MODAL EDIT MODELE ===== */}
      <Modal
        open={isEditModelOpen}
        modalTitle="Modifier modèle"
        onClose={() => setIsEditModelOpen(false)}
      >
        <ModelForm
          mode="edit"
          data={modelFormData}
          brands={brands}
          loading={interactionLoading}
          onChange={setModelFormData}
          onClose={() => setIsEditModelOpen(false)}
          onSubmit={handleUpdateModel}
        />
      </Modal>

    </div>
  </div>
)
}