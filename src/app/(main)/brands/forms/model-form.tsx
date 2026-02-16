"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/spinner"
import { Model } from "@/src/utils/types/model"
import { Brand } from "@/src/utils/types/brand"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"

type Props = {
    mode: "create" | "edit"
    data: Partial<Model>
    brands?: Brand[] // Optional because we might pre-select a brand
    loading: boolean
    onClose: () => void
    onSubmit: () => void
    onChange: (data: Partial<Model>) => void
}

export function ModelForm({
    mode,
    data,
    brands,
    loading,
    onClose,
    onSubmit,
    onChange,
}: Props) {
    return (
        <form>
            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Marque</Label>
                <Select
                    value={data.brandId || ""}
                    onValueChange={(v) => onChange({ ...data, brandId: v })}
                    disabled={!brands || brands.length === 0}
                >
                    <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Sélectionnez une marque" />
                    </SelectTrigger>
                    <SelectContent className="z-[2000]">
                        {brands?.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                                {b.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Nom du modèle</Label>
                <Input
                    className="h-12"
                    value={data.name || ""}
                    onChange={(e) => onChange({ ...data, name: e.target.value })}
                    placeholder="Ex: 208, Clio..."
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
