"use client";

import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Modal } from "@/src/shared/components/modal";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { useEffect, useState } from "react";
import { ClientForm } from "../clients/form/client-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/ui/badge";
import { FamilleForm } from "../famille/forms/famille-form";
import { BadgePercent } from "lucide-react";
import { Label } from "@/src/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select";
import { Input } from "@/src/shared/components/ui/input";
import { successAlert } from "@/src/lib/alerts";
import { useFamilleApi } from "../famille/shared/useFamille.api";
import { useCollectionApi } from "../collection/shared/useCollection.api";
import { useArticleApi } from "../article/shared/useAtricle.api";
import { Famille } from "@/src/utils/types/famille";
import { Collection } from "@/src/utils/types/collection";
import { Article } from "@/src/utils/types/article";

export default function RemisePage() {
    const [loading, setLoading] = useState(false);
    const [applyRemiseLoading, setApplyRemiseLoading] = useState(false);

    const [familleListe, setFamilleListe] = useState<Famille[]>([]);
    const [collectionListe, setCollectionListe] = useState<Collection[]>([]);
    const [articleListe, setArticleListe] = useState<Article[]>([]);

    const [familleSelected, setFamilleSelected] = useState<number | null>(null);
    const [collectionSelected, setCollectionSelected] = useState<number | null>(null);
    const [articleSelected, setArticleSelected] = useState<number | null>(null);

    const [remiseValue, setRemiseValue] = useState<number>(0);
    const [pourcentageRemise, setPourcentageRemise] = useState<number>(0);

    const {getAllFamilles} = useFamilleApi();
    const {getAllCollections} = useCollectionApi();
    const {getArticles} = useArticleApi();

    const loadData = async () => {
        try{
            const famillesData = await getAllFamilles();
            setFamilleListe(famillesData);
            const collectionsData = await getAllCollections();
            setCollectionListe(collectionsData);
            const articlesData = await getArticles();
            setArticleListe(articlesData);
        }catch(e:any){
           throw new Error(e);
        }
    }

    useEffect(() => {

        const init = async () => {
            setLoading(true);
            try {
                await loadData();
            }catch (e: any) {
                console.error("Erreur lors du chargement des données :", e);
                return;
            }
            finally {
                setLoading(false);
            }
        };
        init();

        // // Fetch familles
        // setFamilleListe([
        //     { id: 1, name: "Famille A" },
        //     { id: 2, name: "Famille B" },
        //     { id: 3, name: "Famille C" },
        // ]);
        // // Fetch collections
        // setCollectionListe([
        //     { id: 1, name: "Collection A", familleId: 1 },
        //     { id: 2, name: "Collection B", familleId: 2 },
        //     { id: 3, name: "Collection C", familleId: 3 },
        // ]);
        // // Fetch articles
        // setArticleListe([
        //     { id: 1, name: "Article A", price: 100, collectionId: 1 },
        //     { id: 2, name: "Article B", price: 200, collectionId: 2 },
        //     { id: 3, name: "Article C", price: 300, collectionId: 3 },
        // ]);
    }, []);

    const handleCreate = async () => {
        setApplyRemiseLoading(true);

        await new Promise(resolve => setTimeout(resolve, 1000));
        setApplyRemiseLoading(false);
        successAlert("Succès", "Rémise appliquée avec succès.");
    }
        
    return(
        <div className="p-10 shadow  bg-white rounded-lg m-4">
            <div className="flex mb-2 p-6 gap-4 items-center">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <BadgePercent />
                </div>
                <h2 className="font-bold text-2xl">Gestion des Remises</h2>
            </div>
            <div className="rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                    <Label>Famille</Label>
                    <Select value={String(familleSelected)} onValueChange={(v) => setFamilleSelected(Number(v))}>
                        <SelectTrigger className="w-full !h-16">
                            {loading && <Spinner />}
                            <SelectValue placeholder="Sélectionnez une famille" />
                        </SelectTrigger>
                        <SelectContent className="z-[2000]">
                            {familleListe.map((f) => (
                                <SelectItem key={f.fam_id} value={String(f.fam_id)}>
                                    {f.fam_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Collection</Label>
                    <Select value={String(collectionSelected)} onValueChange={(v) => { setCollectionSelected(Number(v)); setArticleSelected(null) }} disabled={!familleSelected}>
                        <SelectTrigger className="w-full !h-16">
                            {loading && <Spinner />}
                            <SelectValue placeholder="Sélectionnez une collection" />
                        </SelectTrigger>
                        <SelectContent className="z-[2000]">
                            {collectionListe
                                .filter(c => !familleSelected || c.col_familleId === Number(familleSelected))
                                .map((c) => (
                                <SelectItem key={c.col_id} value={String(c.col_id)}>
                                    {c.col_name}
                                </SelectItem>
                            ))} 
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Article</Label>
                    <Select value={String(articleSelected)} onValueChange={(v) => setArticleSelected(Number(v))} disabled={!collectionSelected}>
                        <SelectTrigger className="w-full !h-16">
                            {loading && <Spinner />}
                            <SelectValue placeholder="Sélectionnez un article" />
                        </SelectTrigger>
                        <SelectContent className="z-[2000]">
                            {articleListe
                                .filter(a => !collectionSelected || a.art_collectionId === Number(collectionSelected))
                                .map((a) => (
                                <SelectItem key={a.art_id} value={String(a.art_id)}>
                                    {a.art_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Prix rémisé</Label>
                        <Input
                            id="remise"
                            min={0}
                            type="number"
                            placeholder=""
                            className="h-16"
                            value={remiseValue}
                            disabled={pourcentageRemise > 0}
                            onChange={(e) =>{
                                setRemiseValue(Number(e.target.value))
                            }}
                        />
                    </div>
                    <div>
                        <Label>%</Label>
                        <Input
                            id="remise"
                            min={0}
                            type="number"
                            placeholder=""
                            className="h-16"
                            disabled={remiseValue > 0}
                            value={pourcentageRemise}
                            onChange={(e) =>{
                                setPourcentageRemise(Number(e.target.value))
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">

                        <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wide text-gray-500">
                            Article
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                            {articleSelected
                                ? articleListe.find(a => a.art_id === Number(articleSelected))?.art_name
                                : "..."}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wide text-gray-500">
                            Prix
                            </span>
                            <Badge className="w-fit bg-green-100 text-green-800">
                            {articleSelected
                                ? articleListe.find(a => a.art_id === Number(articleSelected))?.art_price
                                : "..."}
                            </Badge>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wide text-gray-500">
                            Remise
                            </span>
                            <Badge className="w-fit bg-blue-100 text-blue-800">
                            {remiseValue}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wide text-gray-500">
                            %tage
                            </span>
                            <Badge className="w-fit bg-blue-100 text-blue-800">
                            {pourcentageRemise} %
                            </Badge>
                        </div>

                    </div>

                    <div className="flex justify-end">
                        <Button type="button" onClick={handleCreate} disabled={applyRemiseLoading || (!articleSelected || (remiseValue <=0 && pourcentageRemise <=0))}>
                            {applyRemiseLoading && <Spinner className="mr-2 h-4 w-4" />}
                            Appliquer la remise
                        </Button>
                    </div>

                </div>
            </div>

        </div>
    )
}