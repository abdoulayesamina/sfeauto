"use client"
import { useState } from "react";
import { ClientForm } from "./form/client-form";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";
import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/generated/prisma";
import { DataTable } from "@/src/shared/components/data-table";

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
                <span>Page Clients</span>
                <Button variant={"outline"} onClick={handleOpen}>
                    Ajouter un client
                </Button>
            </div>

            <div>
                <DataTable data={} columnsProps={columns} />
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