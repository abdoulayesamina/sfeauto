"use client";

import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Modal } from "@/src/shared/components/modal";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/ui/badge";
import { CollectionForm } from "./forms/collection-form";
import { useCollectionApi } from "./shared/useCollection.api";
import { successAlert,errorAlert, confirmAlert } from "@/src/lib/alerts";
import { Collection } from "@/src/utils/types/collection";
import { useFamilleApi } from "../famille/shared/useFamille.api";
import { Famille } from "@/src/utils/types/famille";

export default function CollectionPage() {
    const { getAllCollections, createCollection, updateCollection, deleteCollection } = useCollectionApi();
    const {getAllFamilles} = useFamilleApi();

    const [loading, setLoading] = useState(false);
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [collectionsSearch, setCollectionsSearch] = useState<Collection[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [familles, setFamilles] = useState<Famille[]>([]);

    const loadCollections = async () => {
        try {
            const data = await getAllCollections();
            setCollections(data);

            const famillesData = await getAllFamilles();
            setFamilles(famillesData);
        }catch (e: any) {
           throw new Error(e);
        }
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                await loadCollections();
            }catch (e: any) {
                errorAlert("Erreur", e.message);
                return;
            } 
            finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    useEffect(() => {
        setCollectionsSearch(collections);
    },[collections]);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "col_name",
            header: "Nom",
        },
        {
            accessorKey: "col_familleId",
            header: "Famille",
            cell: ({ row }) => {
                const famille = familles.find(f => f.fam_id === row.original.col_familleId);
                return <Badge>{famille ? famille.fam_name : "N/A"}</Badge>;
            }
        },
        {
            header: "Actions",
            cell: ({ row }) => (
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdate(row.original)} disabled={idToDelete === row.original.art_id}>
                    Modifier
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(row.original)} disabled={idToDelete === row.original.col_id}>
                    <span className="flex items-center gap-2">
                        {idToDelete === row.original.col_id ? <Spinner className="size-4" /> : ""}
                        Supprimer
                    </span>
                </Button>
            </div>
            ),
        },
    ];

    const tableColumns = createColumns({columns});

    const handleSearch = (e: string) => {
        const filtered = collections.filter((collection) =>
            collection.col_name.toLowerCase().includes(e.toLowerCase())
        );
        setCollectionsSearch(filtered);
    }
    const handleCreate = async () => {
         
        let newCollection : Collection = {col_name: formData.col_name, col_familleId: Number(formData.col_familleId)};
        setLoadingCollections(true);

        try{
            const res = await createCollection(newCollection)
            successAlert("Collection créée", "La collection a étée créée avec succès !")
            setFormData({});
            setCollections([...collections, res.collection]);
        }catch(e:any){
            errorAlert("Erreur", e.message);
            setLoadingCollections(false);
            return;
        }

        setLoadingCollections(false);
        setFormData({});
        setIsOpen(false)
    }

    const handleUpdate = async (data: any) => {
        setFormData(data)
        setEditOpen(true)
    }

    const handleUpdateSubmit = async () => {
        let updated : Collection = {col_id: formData.col_id, col_name: formData.col_name, col_familleId: Number(formData.col_familleId)};
        setLoadingCollections(true);

        try{
            await updateCollection(updated)
            successAlert("Collection modifiée", "La collection a étée modifiée avec succès !")
        }catch(e:any){
            errorAlert("Erreur", e.message);
            setLoadingCollections(false);
            return;
        }

        setCollections(collections.map(c=> c.col_id === updated.col_id ? updated : c))
        setLoadingCollections(false);
        setFormData({})
        setEditOpen(false)
    }

    const handleDelete = async (data: any) => {
        const confirmed = await confirmAlert("Suprimer la collection",`Voulez-vous vraiment supprimer la collection ${data.col_name} ?`)
        if (!confirmed) return;
        setIdToDelete(data.col_id);

        try{
            await deleteCollection(data.col_id)
            successAlert("Collection supprimée", "La collection a étée supprimée avec succès !")
        }catch(e:any){
            errorAlert("Erreur", e.message);
            setIdToDelete(null);
            return;
        }

        setIdToDelete(null);
        let filteredCollections = collections.filter(c=>c.col_id !== data.col_id)
        setCollections(filteredCollections)
    }

    return(
        <div className="p-10">
            <div className="flex justify-between mb-2 p-6 items-center">
                <h2 className="font-bold text-2xl">Gestion des Collections</h2>
                <Button onClick={() => setIsOpen(true)}>Ajouter une collection</Button>
            </div>
            
            {loading && <div className="px-6 flex justify-center mb-4">
                <Spinner className="size-6" />
            </div>}

            {<DataTable data={collectionsSearch} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)}/>}

            {/* CREATE */}
            <Modal open={isOpen} modalTitle="Nouvelle collection" onClose={() => setIsOpen(false)}>
                <CollectionForm
                    mode="create"
                    data={formData}
                    loading={loadingCollections}
                    onChange={setFormData}
                    onClose={() => setIsOpen(false)}
                    onSubmit={handleCreate}
                />
            </Modal>

            {/* EDIT */}
            <Modal open={editOpen} modalTitle="Modifier collection" onClose={() => setEditOpen(false)}>
                <CollectionForm
                    mode="edit"
                    data={formData}
                    loading={loadingCollections}
                    onChange={setFormData}
                    onClose={() => setEditOpen(false)}
                    onSubmit={handleUpdateSubmit}
                />
            </Modal>
        </div>
    )
}