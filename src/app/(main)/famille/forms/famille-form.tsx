"use client"

import { Spinner } from "@/src/shared/components/spinner"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Famille } from "@/src/utils/types/famille"
import { useEffect, useRef } from "react"

type Props = {
  mode: "create" | "edit"
  data: Famille
  loading: boolean
  onClose: () => void
  onSubmit: () => void
  onChange: (data: any) => void
}

export function FamilleForm({
  mode,
  data,
  loading,
  onClose,
  onSubmit,
  onChange,
}: Props) {

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        inputRef.current?.focus();
    }, [mode]);

    return (
        <form>
            <div className="mb-4 flex flex-col gap-2 p-2">
            <Label>Nom</Label>
            <Input
                ref={inputRef}
                className="h-12"
                value={data.fam_name || ""}
                onChange={(e) => onChange({ ...data, fam_name: e.target.value })}
                placeholder="Nom de la famille"
            />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
                Annuler
            </Button>
            <Button type="button" onClick={onSubmit} disabled={loading}>
                <span className="flex items-center gap-2">
                    {loading ? <Spinner /> : ""}
                    {mode === "create" ? "Créer" : "Modifier"}
                </span>
            </Button>
            </div>
        </form>
    )
}
