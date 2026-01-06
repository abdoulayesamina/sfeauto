"use client"
import { useState } from "react";
import { ClientForm } from "./form/client-form";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/src/shared/components/data-table";
import { Client } from "@/src/utils/types/client";

export default function ClientPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [EditOpen, setEditOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);


    const handleClose = () => {
        setIsOpen(false);
        setEditOpen(false)
    }
    const handleOpen = () => {
        setIsOpen(true);
    }

    const handleSubmit = () => {
        setIsOpen(false);
        setEditOpen(false)
    }

     const handleEdit = (client: Client) => {
        setClientToEdit(client)
        setEditOpen(true)
    }



    const handleDelete= (c : Client)=>{
        console.log("sup : ", c);
        
    }

    const dataClient : Client[] = [
        {
            id: "cl_001",
            name: "Abdallah Traoré",
            email: "abdallah.traore@gmail.com",
            phone: "+22370000001",
            createdAt: "2025-01-02T10:15:30.000Z",
            updatedAt: "2025-01-10T08:45:12.000Z",
            _count: {
            bases: 2,
            vehicles: 5,
            },
        },
        {
            id: "cl_002",
            name: "Moussa Diarra",
            email: null,
            phone: "+22370000002",
            createdAt: "2025-01-05T14:20:00.000Z",
            updatedAt: "2025-01-12T09:10:45.000Z",
            _count: {
            bases: 1,
            vehicles: 1,
            },
        },
        {
            id: "cl_003",
            name: "Fatou Coulibaly",
            email: "fatou.coulibaly@gmail.com",
            phone: null,
            createdAt: "2025-01-08T16:30:00.000Z",
            updatedAt: "2025-01-15T11:05:22.000Z",
            _count: {
                bases: 0,
                vehicles: 3,
            },
        },
    ]

    const columns: ColumnDef<Client>[] = [
        { accessorKey: "name", header: "Nom" },
        { accessorKey: "_count.bases", header: "Agence" },
        { accessorKey: "_count.vehicles", header: "Véhicule" },
        {
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleEdit(row.original)}>
                Modifier
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(row.original)}>Supprimer</Button>
            </div>
        ),
        },
    ]

    return (
        <div className="p-10">
            <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Page Clients</span>
                <Button variant={"outline"} onClick={handleOpen}>
                    Ajouter un client
                </Button>
            </div>

            <div>
                <DataTable data={dataClient} columnsProps={columns} />
            </div>
            
            <Modal open={isOpen} modalTitle="Nouveau client" onClose={handleClose} >
                <div>
                    <ClientForm mode="create" onClose={handleClose} onSubmit={handleSubmit} />
                </div>
            </Modal>

            <Modal open={EditOpen} modalTitle="Nouveau client" onClose={handleClose} >
                <div>
                    <ClientForm mode="edit" onClose={handleClose} data={clientToEdit} onSubmit={handleSubmit} />
                </div>
            </Modal>
        </div>
    );
}