"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Trash2, Pencil } from "lucide-react"

type Brand = {
  id: string
  name: string
}

type Model = {
  id: string
  name: string
  brandId: string
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)

  const [newBrand, setNewBrand] = useState("")
  const [newModel, setNewModel] = useState("")

  const [brandSearch, setBrandSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")

  const [editingBrandId, setEditingBrandId] = useState<string | null>(null)
  const [editingModelId, setEditingModelId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  // ================= LOAD =================

  const loadBrands = async () => {
    const res = await fetch("/api/brands")
    setBrands(await res.json())
  }

  const loadModels = async (brandId: string) => {
    const res = await fetch(`/api/models?brandId=${brandId}`)
    setModels(await res.json())
  }

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    if (selectedBrandId) loadModels(selectedBrandId)
    else setModels([])
  }, [selectedBrandId])

  // ================= FILTER =================

  const filteredBrands = useMemo(
    () =>
      brands.filter((b) =>
        b.name.toLowerCase().includes(brandSearch.toLowerCase())
      ),
    [brands, brandSearch]
  )

  const filteredModels = useMemo(
    () =>
      models.filter((m) =>
        m.name.toLowerCase().includes(modelSearch.toLowerCase())
      ),
    [models, modelSearch]
  )

  // ================= CREATE =================

  const createBrand = async () => {
    if (!newBrand.trim()) return
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBrand }),
    })
    if (res.ok) {
      setNewBrand("")
      loadBrands()
    } else alert((await res.json()).error)
  }

  const createModel = async () => {
    if (!newModel.trim() || !selectedBrandId) return
    const res = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newModel, brandId: selectedBrandId }),
    })
    if (res.ok) {
      setNewModel("")
      loadModels(selectedBrandId)
    } else alert((await res.json()).error)
  }

  // ================= UPDATE =================

  const updateBrand = async (id: string) => {
    const res = await fetch(`/api/brands/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue }),
    })

    if (!res.ok) {
      alert((await res.json()).error)
      return
    }

    setEditingBrandId(null)
    setEditValue("")
    loadBrands()
  }

  const updateModel = async (id: string) => {
    const res = await fetch(`/api/models/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue }),
    })

    if (!res.ok) {
      alert((await res.json()).error)
      return
    }

    setEditingModelId(null)
    setEditValue("")
    loadModels(selectedBrandId!)
  }

  // ================= DELETE =================

  const deleteBrand = async (id: string) => {
    if (!confirm("Supprimer cette marque ?")) return
    const res = await fetch(`/api/brands/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert((await res.json()).error)
      return
    }
    if (id === selectedBrandId) setSelectedBrandId(null)
    loadBrands()
  }

  const deleteModel = async (id: string) => {
    if (!confirm("Supprimer ce modèle ?")) return
    const res = await fetch(`/api/models/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert((await res.json()).error)
      return
    }
    loadModels(selectedBrandId!)
  }

  // ================= UI =================

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ===== MARQUES ===== */}
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Marques</h1>

        <Input
          placeholder="Rechercher une marque..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <Input
            placeholder="Nouvelle marque"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
          />
          <Button onClick={createBrand}>Ajouter</Button>
        </div>

        <div className="border rounded-md divide-y max-h-[400px] overflow-auto">
          {filteredBrands.map((b) => (
            <div
              key={b.id}
              className={`flex justify-between items-center p-3 cursor-pointer ${
                selectedBrandId === b.id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedBrandId(b.id)}
            >
              {editingBrandId === b.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => updateBrand(b.id)}
                  autoFocus
                />
              ) : (
                <span>{b.name}</span>
              )}

              <div className="flex gap-2">
                <Pencil
                  className="h-4 w-4 text-blue-500 hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingBrandId(b.id)
                    setEditValue(b.name)
                  }}
                />
                <Trash2
                  className="h-4 w-4 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBrand(b.id)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MODELES ===== */}
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Modèles</h1>

        {!selectedBrandId && (
          <p className="text-muted-foreground">
            Sélectionnez une marque
          </p>
        )}

        {selectedBrandId && (
          <>
            <Input
              placeholder="Rechercher un modèle..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
            />

            <div className="flex gap-2">
              <Input
                placeholder="Nouveau modèle"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
              />
              <Button onClick={createModel}>Ajouter</Button>
            </div>

            <div className="border rounded-md divide-y max-h-[400px] overflow-auto">
              {filteredModels.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center p-3"
                >
                  {editingModelId === m.id ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => updateModel(m.id)}
                      autoFocus
                    />
                  ) : (
                    <span>{m.name}</span>
                  )}

                  <div className="flex gap-2">
                    <Pencil
                      className="h-4 w-4 text-blue-500 hover:text-blue-700"
                      onClick={() => {
                        setEditingModelId(m.id)
                        setEditValue(m.name)
                      }}
                    />
                    <Trash2
                      className="h-4 w-4 text-red-500 hover:text-red-700"
                      onClick={() => deleteModel(m.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
