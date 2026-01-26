"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"
import { useFamilleApi } from "../../famille/shared/useFamille.api"
import { useEffect, useState } from "react"
import { Spinner } from "@/src/shared/components/spinner"
import { Famille } from "@/src/utils/types/famille"

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
    const { getAllFamilles } = useFamilleApi();
    const [loadingFamilles, setLoadingFamilles] = useState(false);
    const [familles, setFamilles] = useState<Famille[]>([]);

    useEffect(() => {
        const fetchFamilles = async () => {
            setLoadingFamilles(true);
            try {
                const famillesData = await getAllFamilles();
                setFamilles(famillesData);
            } catch (e) {
                console.error("Erreur lors du chargement des familles :", e);
            }
            finally {
                setLoadingFamilles(false);
            }
        };
        fetchFamilles();
    }, []);

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
                <Select value={String(data.familleId) || ""} onValueChange={(v) => onChange({ ...data, familleId: v })} disabled={loadingFamilles}>
                <SelectTrigger className="w-full !h-16">
                    {loadingFamilles ? <Spinner /> : ""}
                    <SelectValue placeholder="Sélectionnez une famille" />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                    {familles.map((f) => (
                        <SelectItem key={f.fam_id} value={String(f.fam_id)}>
                            {f.fam_name}
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
