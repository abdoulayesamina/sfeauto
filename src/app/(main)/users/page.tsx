"use client"

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";

import { useState } from "react";
import { UserForm } from "./form/user-form";
import { ColumnDef } from "@tanstack/react-table";
import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { User } from "@/src/utils/types/user";

export default function UsersPage() {

    const dataMock : User[] = [
        { id: "1", name: "John Doe", email: "john@example.com", role: "Admin", clientId: null, baseId: null, createdAt: "2023-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z", client: null, base: null },
        { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User", clientId: null, baseId: null, createdAt: "2023-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z", client: null, base: null },
        { id: "3", name: "Bob Johnson", email:"bob@example.com", role:"Manager" , clientId:null, baseId:null, createdAt:"256789456789456789456789456789456789456789456789456789456789456789456789456789456789456789456789456789456789456789456789" , updatedAt:"256789456789456789456789456789456789456789456789456789456789456789456789456789456789456789456789456789" , client:null, base:null },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
        setEditOpen(false);
    }
    const handleOpen = () => {
        setIsOpen(true);
    }

    const handleEditOpen = () => {
        setEditOpen(true);
    }

    const handleSubmit = () => {
        setIsOpen(false);
        setEditOpen(false);
    }


    const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
    const handleModify = (rowData: any) => {
        handleEditOpen();
        setUserToEdit(rowData);
    }

    const handleDelete = (rowData: any) => {
        console.log("Delete", rowData);
    }

    const columns : ColumnDef<any>[] = [
        { 
            accessorKey: 'name',
            header: 'Nom',
            cell: ({ row }) => (
            <div className="font-medium">{row.original.name}</div>
            ),
        },

        { 
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
            <div className="text-sm text-gray-500">{row.original.email}</div>
            ),
        },
        { 
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => (
            <div className="text-sm text-gray-500">{row.original.role}</div>
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
            <div className="flex items-center justify-between mb-4 px-6">
                <span className="font-bold">Gestion des utilisateurs</span>
                <Button onClick={handleOpen}>
                    Ajouter un utilisateur
                </Button>
            </div>
            <div>
                 <DataTable data={dataMock} columnsProps={tableColumns} />
            </div>
            <Modal open={isOpen} modalTitle="Nouvel utilisateur" onClose={handleClose} >
                <div>
                    <UserForm onClose={handleClose} onSubmit={handleSubmit} mode="create"/>
                </div>
            </Modal>

            <Modal open={editOpen} modalTitle="Modifier utilisateur" onClose={handleClose} >
                <div>
                    <UserForm onClose={handleClose} onSubmit={handleSubmit} mode="edit" data={userToEdit} />
                </div>
            </Modal>
        </div>
    );
}