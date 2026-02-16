"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/spinner"
import { Brand } from "@/src/utils/types/brand"

type Props = {
    mode: "create" | "edit"
    data: Partial<Brand>
    loading: boolean
    onClose: () => void
    onSubmit: () => void
    onChange: (data: Partial<Brand>) => void
}

export function BrandForm({
    mode,
    data,
    loading,
    onClose,
    onSubmit,
    onChange,
}: Props) {
    return (
        <form>
            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Nom de la marque</Label>
                <Input
                    className="h-12"
                    value={data.name || ""}
                    onChange={(e) => onChange({ ...data, name: e.target.value })}
                    placeholder="Ex: Peugeot, Renault..."
                />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Annuler
                </Button>
                <Button type="button" onClick={onSubmit} disabled={loading}>
                    <span className="flex items-center gap-2">
                        {loading ? <Spinner className="size-4" /> : ""}
                        {mode === "create" ? "Créer" : "Modifier"}
                    </span>
                </Button>
            </div>
        </form>
    )
}
