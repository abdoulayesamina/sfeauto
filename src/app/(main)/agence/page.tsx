"use client"

import { Button } from "@/src/shared/components/ui/button"; 
import { Modal } from "@/src/shared/components/modal";
import { useState } from "react";
import { AgenceForm } from "./form/agence-form";
import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Agence } from "@/src/utils/types/agence";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/ui/badge";

export default function AgencePage() {
    
    const dataMock : Agence[] = [
        { id: "1", location: "Paris", clientId: "1", createdAt: "2023-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z", client: { name: "Client A" }, _count: { vehicles: 5 } },
        { id: "2", location: "Lyon", clientId: "2", createdAt: "2023-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z", client: { name: "Client B" }, _count: { vehicles: 3 } },
        { id: "3", location: "Marseille", clientId: "3", createdAt: "2023-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z", client: { name: "Client C" }, _count: { vehicles: 8 } },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [EditOpen, setIsEditOpen] = useState(false);
    const [agenceToEdit, setAgenceToEdit] = useState<Agence | undefined>(undefined);
    const handleClose = () => {
        setIsOpen(false);
        setIsEditOpen(false);
    }
    const handleOpen = () => {
        setIsOpen(true);
    }
    const handleEditOpen = () => {
        setIsEditOpen(true);
    }

    const handleSubmit = () => {
        setIsOpen(false);
        setIsEditOpen(false);
    }

    const handleModify = (rowData: any) => {
        console.log("Modify", rowData);
        setAgenceToEdit(rowData);
        handleEditOpen();
    }

    const handleDelete = (rowData: any) => {
        console.log("Delete", rowData);
    }


    const columns : ColumnDef<any>[] = [
        { 
            accessorKey: 'emplacement',
            header: 'Emplacement',
            cell: ({ row }) => (
            <div className="font-medium">{row.original.location}</div>
            ),
        },

        { 
            accessorKey: 'client',
            header: 'Client',
            cell: ({ row }) => (
            <div className="text-sm text-gray-500">{row.original.client?.name || "N/A"}</div>
            ),
        },
        { 
            accessorKey: 'vehicules',
            header: 'Véhicules',
            cell: ({ row }) => (
            <div><Badge className="bg-green-200 text-green-1000">{row.original._count?.vehicles || 0}</Badge></div>
            ),
        },
        { 
            accessorKey: 'Actions',
            header: 'Actions',
            cell: ({ row }) => (
            <div className="flex gap-2 items-center justify-start">
                <Button variant={"outline"} onClick={() => handleModify(row.original)}>Modifier</Button>
                <Button variant={"destructive"} onClick={() => handleDelete(row.original)}>Suprimmer</Button>
            </div>
            ),
        },
    ]
    const tableColumns = createColumns({columns});

    return (
        <div className="p-10">
            <div className="flex justify-between items-center mb-4 px-6">
                <span className="font-bold">Page Agences</span>
                <Button variant={"outline"} onClick={handleOpen}>
                    Ajouter une agence
                </Button>
            </div>
            <div>
                <DataTable data={dataMock} columnsProps={tableColumns} />
            </div>
            <Modal open={isOpen} modalTitle="Nouvelle agence" onClose={handleClose} >
                <div>
                    <AgenceForm mode="create" onClose={handleClose} onSubmit={handleSubmit} />
                </div>
            </Modal>
            <Modal open={EditOpen} modalTitle="Modifier une agence" onClose={handleClose} >
                <div>
                    <AgenceForm mode="edit" data={agenceToEdit} onClose={handleClose} onSubmit={handleSubmit} />
                </div>
            </Modal>
        </div>
    );
}