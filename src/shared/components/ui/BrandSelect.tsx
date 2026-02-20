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

type Brand = { id: string; name: string }

export function BrandSelect({
  value,
  onChange,
}: {
  value: string | null
  onChange: (id: string) => void
}) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  useEffect(() => {
    fetch("/api/brands")
      .then(res => res.json())
      .then(setBrands)
  }, [])

  async function createBrand() {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })

    const brand = await res.json()
    setBrands(prev => [...prev, brand])
    onChange(brand.id)
    setNewName("")
    setCreating(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
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
          <SelectValue placeholder="Sélectionner une marque" />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          {brands.map(b => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
          <SelectItem value="__create__">➕ Créer une marque</SelectItem>
        </SelectContent>
      </Select>

      {creating && (
        <div className="flex gap-2">
          <Input
            placeholder="Nom de la marque"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="button" onClick={createBrand} disabled={!newName}>
            Créer
          </Button>
        </div>
      )}
    </div>
  )
}
