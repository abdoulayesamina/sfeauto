"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Famille } from "@/src/utils/types/famille"

type Props = {
  mode: "create" | "edit"
  data: Famille
  onClose: () => void
  onSubmit: () => void
  onChange: (data: any) => void
}

export function FamilleForm({
  mode,
  data,
  onClose,
  onSubmit,
  onChange,
}: Props) {
    return (
        <form>
            <div className="mb-4 flex flex-col gap-2 p-2">
            <Label>Nom</Label>
            <Input
                className="h-16"
                value={data.fam_name || ""}
                onChange={(e) => onChange({ ...data, fam_name: e.target.value })}
                placeholder="Nom de la famille"
            />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
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
