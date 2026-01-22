"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"

type Props = {
  mode: "create" | "edit"
  data: any
  onClose: () => void
  onSubmit: () => void
  onChange: (data: any) => void
}

export function CollectionForm({
  mode,
  data,
  onClose,
  onSubmit,
  onChange,
}: Props) {
    const familles = [
        { id: 1, name: "Famille A" },
        { id: 2, name: "Famille B" },
        { id: 3, name: "Famille C" },
    ];
    return (
        <form>
            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Nom</Label>
                <Input
                    className="h-16"
                    value={data.name || ""}
                    onChange={(e) => onChange({ ...data, name: e.target.value })}
                    placeholder="Nom de la collection"
                />
            </div>

            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Famille</Label>
                <Select value={String(data.familleId) || ""} onValueChange={(v) => onChange({ ...data, familleId: v })}>
                <SelectTrigger className="w-full !h-16">
                    <SelectValue placeholder="Sélectionnez une famille" />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                    {familles.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                            {f.name}
                        </SelectItem>
                    ))}
                </SelectContent>
                </Select>
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
