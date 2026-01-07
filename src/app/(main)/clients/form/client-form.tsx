"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Client } from "@/generated/prisma"

type Props = {
  mode: "create" | "edit"
  data: Partial<Client>
  onClose: () => void
  onSubmit: () => void
  onChange: (data: Partial<Client>) => void
}

export function ClientForm({
  mode,
  data,
  onClose,
  onSubmit,
  onChange,
}: Props) {
  return (
    <form>
      <div className="mb-4 flex flex-col gap-2">
        <Label>Nom</Label>
        <Input
          className="h-16"
          value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Nom du client"
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="button" onClick={onSubmit}>
          {mode === "create" ? "Créer" : "Modifier"}
        </Button>
      </div>
    </form>
  )
}
