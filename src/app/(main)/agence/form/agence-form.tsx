"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Button } from "@/src/shared/components/ui/button"
import { Agence } from "@/src/utils/types/agence"

type Props = {
  mode: "create" | "edit"
  data: Partial<Agence>
  clients: { id: string; name: string }[]
  onClose: () => void
  onSubmit: () => void
  onChange: (data: Partial<Agence>) => void
}

export function AgenceForm({ mode, data, clients, onClose, onSubmit, onChange }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-col gap-2">
        <Label>Client</Label>
        <Select value={data.clientId || ""} onValueChange={(v) => onChange({ ...data, clientId: v })}>
          <SelectTrigger className="w-full !h-16">
            <SelectValue placeholder="Sélectionnez un client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <Label>Emplacement</Label>
        <Input
          className="h-16"
          value={data.location || ""}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          placeholder="Emplacement"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  )
}
