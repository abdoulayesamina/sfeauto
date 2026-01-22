"use client";

import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Modal } from "@/src/shared/components/modal";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/ui/badge";
import { CollectionForm } from "./forms/collection-form";

export default function CollectionPage() {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [collectionsSearch, setCollectionsSearch] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [familles, setFamilles] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
        setFamilles([
            { id: 1, name: "Famille A" },
            { id: 2, name: "Famille B" },
            { id: 3, name: "Famille C" },
        ]);
        setCollections([
            { id: 1, name: "Collection A", familleId: 1 },
            { id: 2, name: "Collection B", familleId: 2 },
            { id: 3, name: "Collection C", familleId: 3 },
        ]);
    }, []);

    useEffect(() => {
        setCollectionsSearch(collections);
    },[collections]);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Nom",
        },
        {
            accessorKey: "familleId",
            header: "Famille",
            cell: ({ row }) => {
                const famille = familles.find(f => f.id === row.original.familleId);
                return <Badge>{famille ? famille.name : "N/A"}</Badge>;
            }
        },
        {
            header: "Actions",
            cell: ({ row }) => (
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdate(row.original)}>
                Modifier
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(row.original)}>
                Supprimer
                </Button>
            </div>
            ),
        },
    ];

    const tableColumns = createColumns({columns});

    const handleSearch = (e: string) => {
        const filtered = collections.filter((collection) =>
            collection.name.toLowerCase().includes(e.toLowerCase())
        );
        setCollectionsSearch(filtered);
    }
    const handleCreate = async () => {
        let newCollections = [...collections, {id: collections.length + 1, name: formData.name, familleId: Number(formData.familleId)}]
        setCollections(newCollections)
        setIsOpen(false)
    }
    const handleUpdate = async (data: any) => {
        setFormData(data)
        setEditOpen(true)
    }
    const handleUpdateSubmit = async () => {
        debugger;
        let updated = collections.map(c =>
            c.id === formData.id
            ? {
                ...c,
                name: formData.name,
                familleId: Number(formData.familleId),
                }
            : c
        );
        setCollections(updated)
        setFormData({})
        setEditOpen(false)
    }

    const handleDelete = async (data: any) => {
        if(!confirm(`Supprimer la collection ${data.name} ?`)) return;
        let filteredCollections = collections.filter(c=>c.id !== data.id)
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
                    onChange={setFormData}
                    onClose={() => setEditOpen(false)}
                    onSubmit={handleUpdateSubmit}
                />
            </Modal>
        </div>
    )
}