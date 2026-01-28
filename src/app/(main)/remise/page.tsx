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
import { errorAlert, successAlert } from "@/src/lib/alerts";
import { useFamilleApi } from "../famille/shared/useFamille.api";
import { useCollectionApi } from "../collection/shared/useCollection.api";
import { useArticleApi } from "../article/shared/useAtricle.api";
import { Famille } from "@/src/utils/types/famille";
import { Collection } from "@/src/utils/types/collection";
import { Article } from "@/src/utils/types/article";
import { Remise } from "@/src/utils/types/remise";
import { log } from "console";
import { useRemiseApi } from "./shared/hooks/useRemise.api";
import { RemiseDataTable } from "./shared/components/remise-datatable";

export default function RemisePage() {

    const {createRemise, updateRemise} = useRemiseApi();

    const [loading, setLoading] = useState(false);
    const [applyRemiseLoading, setApplyRemiseLoading] = useState(false);

    const [familleListe, setFamilleListe] = useState<Famille[]>([]);
    const [collectionListe, setCollectionListe] = useState<Collection[]>([]);
    const [articleListe, setArticleListe] = useState<Article[]>([]);

    const [familleIdSelected, setFamilleIdSelected] = useState<number | null>(null);
    const [collectionIdSelected, setCollectionIdSelected] = useState<number | null>(null);
    const [articleIdSelected, setArticleIdSelected] = useState<number | null>(null);

    const [remiseValue, setRemiseValue] = useState<number>(0);
    const [pourcentageRemise, setPourcentageRemise] = useState<number>(0);

    const [refreshDataTable, setRefreshDataTable] = useState(0);
    const [modeUpdate, setModeUpdate] = useState(false);

    const [remise, setRemise] = useState<Remise>({
        rem_articleId: 0, 
        rem_prixremise: null,
        rem_pourcentage: null,
    });

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
    }, []);

    useEffect(() => {
        console.log("La remise : ", remise);
    }, [remise]);

    const handleArticleIdChange = (v: number) => {
        setArticleIdSelected(v)
        setRemise((prev) => ({...(prev ?? {}), rem_articleId: v,}));
    };

    const handlePrixRemise = (v: number) => {
        setRemiseValue(v)
        setRemise((prev) => ({ ...(prev ?? {}), rem_prixremise: v }));
    };

    const handlePourcentage = (v: number) => {
        setPourcentageRemise(v)
        setRemise((prev) => ({ ...(prev ?? {}), rem_pourcentage: v }));
    };


    const handleCreate = async () => {
        try{
            setApplyRemiseLoading(true);
            const res = await createRemise(remise);
            setApplyRemiseLoading(false);
            successAlert("Succès", "Rémise appliquée avec succès.");

            setRefreshDataTable(r=>r+1)
            setArticleIdSelected(null)
            setPourcentageRemise(0)
            setRemiseValue(0)
            setCollectionIdSelected(null)
            setFamilleIdSelected(null)
            
        }catch(e : any){
            errorAlert("Erreur de création", `${e.error||e.message||"Erreur lors de la création de remise"}`)
            setApplyRemiseLoading(false);
            return;
        }
    }

    const handleEdit = (data:Remise)=>{
        setModeUpdate(true)
        setRemise((prev) => ({ ...(prev ?? {}), rem_id: data.rem_id}));
        handleArticleIdChange(data.rem_articleId)
        handlePourcentage(data.rem_pourcentage ?? 0)
        handlePrixRemise(data.rem_prixremise ?? 0)

        const collectionIdSelect = articleListe.find((a)=>a.art_id == data.rem_articleId)?.art_collectionId
        setCollectionIdSelected(collectionIdSelect ?? null)

        const familleIdSelect = collectionListe.find(c=> c.col_id == collectionIdSelect)?.col_familleId
        setFamilleIdSelected(familleIdSelect ?? null)

    }

    const HandleEditSubmit = async () =>{
        try{
            setApplyRemiseLoading(true);
            console.log("Modification : ", remise);
            const res = await updateRemise(remise);
            setApplyRemiseLoading(false);
            successAlert("Succès", "Rémise modifié avec succès.");
            setRefreshDataTable(r=>r+1)
            cancelEdit()
        }catch(e : any){
            errorAlert("Erreur de modification", `${e.error||e.message||"Erreur lors de la modification de remise"}`)
            setApplyRemiseLoading(false);
            return;
        }
    } 

    const cancelEdit = ()=>{
        setModeUpdate(false)
        setArticleIdSelected(null)
        setPourcentageRemise(0)
        setRemiseValue(0)
        setCollectionIdSelected(null)
        setFamilleIdSelected(null)
    }

    return(
        <div className="shadow bg-white rounded-lg m-3">
            <div className="p-10 mx-4 mt-2">
                <div className="flex mb-2 p-6 gap-4 items-center">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <BadgePercent />
                    </div>
                    <h2 className="font-bold text-2xl">Gestion des Remises</h2>
                </div>
                <div className="rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div>
                        <Label>Famille</Label>
                        <Select value={String(familleIdSelected)} onValueChange={(v) => setFamilleIdSelected(Number(v))}>
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
                        <Select value={String(collectionIdSelected)} disabled={!familleIdSelected}
                            onValueChange={(v) => { 
                                setCollectionIdSelected(Number(v)); 
                                setArticleIdSelected(null)
                                 if(modeUpdate)setModeUpdate(false) 
                            }} 
                        >
                            <SelectTrigger className="w-full !h-16">
                                {loading && <Spinner />}
                                <SelectValue placeholder="Sélectionnez une collection" />
                            </SelectTrigger>
                            <SelectContent className="z-[2000]">
                                {collectionListe
                                    .filter(c => !familleIdSelected || c.col_familleId === Number(familleIdSelected))
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
                        <Select value={String(articleIdSelected)} disabled={!collectionIdSelected}
                            onValueChange={(v) => {
                                handleArticleIdChange(Number(v))
                                if(modeUpdate)setModeUpdate(false)
                            }} 
                        >
                            <SelectTrigger className="w-full !h-16">
                                {loading && <Spinner />}
                                <SelectValue placeholder="Sélectionnez un article" />
                            </SelectTrigger>
                            <SelectContent className="z-[2000]">
                                {articleListe
                                    .filter(a => !collectionIdSelected || a.art_collectionId === Number(collectionIdSelected))
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
                                    handlePrixRemise(Number(e.target.value))
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
                                    handlePourcentage(Number(e.target.value))
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">

                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-wide text-gray-500">
                                    Article
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                {articleIdSelected
                                    ? articleListe.find(a => a.art_id === Number(articleIdSelected))?.art_name
                                    : "..."}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-wide text-gray-500">
                                Prix
                                </span>
                                <Badge variant={"secondary"} className="w-fit">
                                {articleIdSelected
                                    ? articleListe.find(a => a.art_id === Number(articleIdSelected))?.art_price
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

                        <div className="flex justify-start md:justify-end ">
                            {modeUpdate ?
                                <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
                                    <Button className="bg-orange-700" type="button" onClick={HandleEditSubmit} disabled={applyRemiseLoading || (!articleIdSelected || (remiseValue <=0 && pourcentageRemise <=0))}>
                                        {applyRemiseLoading && <Spinner className="mr-2 h-4 w-4" />}
                                        Modifier la remise
                                    </Button>
                                    <Button type="button" onClick={cancelEdit} >
                                        Annuler
                                    </Button>
                                </div>
                                :
                                <Button type="button" onClick={handleCreate} disabled={applyRemiseLoading || (!articleIdSelected || (remiseValue <=0 && pourcentageRemise <=0))}>
                                    {applyRemiseLoading && <Spinner className="mr-2 h-4 w-4" />}
                                    Appliquer la remise
                                </Button>
                            }
                        </div>

                    </div>
                </div>
            </div>
            <div className="px-10 mt-6">
                <RemiseDataTable articleListe={articleListe} refresh={refreshDataTable} handleEditSubmit={(r)=>handleEdit(r)}/>
            </div>
        </div>
    )
}









//notess point

/**
 * reference -> code article
 * 
 */