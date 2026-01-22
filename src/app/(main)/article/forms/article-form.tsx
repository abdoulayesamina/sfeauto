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

export function ArticleForm({
  mode,
  data,
  onClose,
  onSubmit,
  onChange,
}: Props) {
    const Collections = [
        { id: 1, name: "Collection A" },
        { id: 2, name: "Collection B" },
        { id: 3, name: "Collection C" },
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
                <Label>Collection</Label>
                <Select value={String(data.collectionId) || ""} onValueChange={(v) => onChange({ ...data, collectionId: v })}>
                <SelectTrigger className="w-full !h-16">
                    <SelectValue placeholder="Sélectionnez une collection" />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                    {Collections.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
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
