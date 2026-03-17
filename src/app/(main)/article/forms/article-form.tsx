"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"
import { useCollectionApi } from "../../collection/shared/useCollection.api"
import { useEffect, useRef, useState } from "react"
import { Spinner } from "@/src/shared/components/spinner"
import { Collection } from "@/src/utils/types/collection"
import { Article } from "@/src/utils/types/article"

type Props = {
  mode: "create" | "edit"
  data: Article
  loading: boolean
  onClose: () => void
  onSubmit: () => void
  onChange: (data: any) => void
}

export function ArticleForm({
  mode,
  data,
  loading,
  onClose,
  onSubmit,
  onChange,
}: Props) {
    const { getAllCollections } = useCollectionApi();
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        inputRef.current?.focus();
    }, [mode]);

    useEffect(() => {
        const fetchCollections = async () => {
            setLoadingCollections(true);
            try {
                const collectionsData = await getAllCollections();
                setCollections(collectionsData);
            } catch (e: any) {
                console.error("Error fetching collections:", e.message);
            } finally {
                setLoadingCollections(false);
            }
        };

        fetchCollections();
    }, []);


    return (
        <form>

            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Collection</Label>
                <Select value={String(data.art_collectionId) || ""} onValueChange={(v) => onChange({ ...data, art_collectionId: v })}>
                <SelectTrigger className="w-full !h-12">
                    {loadingCollections ? <Spinner /> : ""}
                    <SelectValue placeholder="Sélectionnez une collection" />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                    {collections.map((c) => (
                        <SelectItem key={c.col_id} value={String(c.col_id)}>
                            {c.col_name}
                        </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Nom</Label>
                <Input
                    ref={inputRef}
                    className="h-12"
                    value={data.art_name || ""}
                    onChange={(e) => onChange({ ...data, art_name: e.target.value })}
                    placeholder="Nom de l'article"
                />
            </div>
            
            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Référence</Label>
                <Input
                    className="h-12"
                    value={data.art_reference || ""}
                    onChange={(e) => onChange({ ...data, art_reference: e.target.value })}
                    placeholder="Ex: FV1, 2PN..."
                />
             </div>

            <div className="mb-4 flex flex-col gap-2 p-2">
                <Label>Prix</Label>
                <Input
                    type="number"
                    className="h-12"
                    value={data.art_price || ""}
                    onChange={(e) => onChange({ ...data, art_price: e.target.value })}
                    placeholder="Prix de l'article"
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
