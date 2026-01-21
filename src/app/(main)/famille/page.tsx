"use client";

import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Modal } from "@/src/shared/components/modal";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { useEffect, useState } from "react";
import { ClientForm } from "../clients/form/client-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/ui/badge";
import { FamilleForm } from "./forms/famille-form";

export default function FamillePage() {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [familleSearch, setfamilleSearch] = useState<any[]>([]);
    const [familles, setFamilles] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
        setFamilles([
            { id: 1, name: "Famille A" },
            { id: 2, name: "Famille B" },
            { id: 3, name: "Famille C" },
        ]);
    }, []);

    useEffect(() => {
        setfamilleSearch(familles);
    },[familles]);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Nom",
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
        const filtered = familles.filter((famille) =>
            famille.name.toLowerCase().includes(e.toLowerCase())
        );
        setfamilleSearch(filtered);
    }
    const handleCreate = async () => {
        let newFamilles = [...familles, {id: familles.length + 1, name: formData.name}]
        setFamilles(newFamilles)
        setIsOpen(false)
    }
    const handleUpdate = async (data: any) => {
        setFormData(data)
        setEditOpen(true)
    }
    const handleUpdateSubmit = async () => {
        let updatedFamilles = familles.map(f=>{
            if(f.id === formData.id){
                f.name = formData.name
            }
        })
        setFamilles(updatedFamilles)
        setFormData({})
        setEditOpen(false)
    }

    const handleDelete = async (data: any) => {
        if(!confirm(`Supprimer la famille ${data.name} ?`)) return;
        let filteredFamilles = familles.filter(f=>f.id !== data.id)
        setFamilles(filteredFamilles)
    }

    return(
        <div className="p-10">
            <div className="flex justify-between mb-2 p-6 items-center">
                <h2 className="font-bold text-2xl">Gestion des familles articles</h2>
                <Button onClick={() => setIsOpen(true)}>Ajouter une famille</Button>
            </div>
            
            {loading && <div className="px-6 flex justify-center mb-4">
                <Spinner className="size-6" />
            </div>}

            {<DataTable data={familleSearch} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)}/>}

            {/* CREATE */}
            <Modal open={isOpen} modalTitle="Nouvelle famille" onClose={() => setIsOpen(false)}>
                <FamilleForm
                    mode="create"
                    data={formData}
                    onChange={setFormData}
                    onClose={() => setIsOpen(false)}
                    onSubmit={handleCreate}
                />
            </Modal>

            {/* EDIT */}
            <Modal open={editOpen} modalTitle="Modifier famille" onClose={() => setEditOpen(false)}>
                <FamilleForm
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