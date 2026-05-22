"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Input } from "@/src/shared/components/ui/input"
import { Button } from "@/src/shared/components/ui/button"

type Model = { id: string; name: string }

// export function ModelSelect({
//   brandId,
//   value,
//   onChange,
// }: {
//   brandId: string | null
//   value: string | null
//   onChange: (id: string) => void
// }) 
export function ModelSelect({
  brandId,
  value,
  modelName,
  onChange,
  disabled,
}: {
  brandId: string | null
  value: string | null
  modelName?: string | null
  onChange: (id: string) => void
  disabled?: boolean
}) {
  const [models, setModels] = useState<Model[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  useEffect(() => {

    if (!value || !modelName) return

    setModels((prev) => {

      const exists = prev.some((m) => m.id === value)

      if (exists) return prev

      return [...prev, { id: value, name: modelName }]

    })

  }, [value, modelName])

  useEffect(() => {
    if (!brandId) {
      setModels([])
      return
    }

    fetch(`/api/models?brandId=${brandId}`)
      .then(res => res.json())
      .then(setModels)
  }, [brandId])

  async function createModel() {
    const res = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, brandId }),
    })

    const model = await res.json()
    setModels(prev => [...prev, model])
    onChange(model.id)
    setNewName("")
    setCreating(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
        disabled={disabled || !brandId}
        value={value ?? ""}
        onValueChange={(v) => {
          if (v === "__create__") {
            setCreating(true)
          } else {
            onChange(v)
          }
        }}
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Sélectionner un modèle" />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          {models.map(m => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
          <SelectItem value="__create__">➕ Créer un modèle</SelectItem>
        </SelectContent>
      </Select>

      {creating && brandId && (
        <div className="flex gap-2">
          <Input
            placeholder="Nom du modèle"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="button" onClick={createModel} disabled={!newName}>
            Créer
          </Button>
        </div>
      )}
    </div>
  )
}
