"use client"
import { useState } from "react";
import { ClientForm } from "./form/client-form";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";

export default function ClientPage() {
    const [isOpen, setIsOpen] = useState(false);
    const handleClose = () => {
        setIsOpen(false);
    }
    const handleOpen = () => {
        setIsOpen(true);
    }

    const handleSubmit = () => {
        setIsOpen(false);
    }

    return (
        <div className="p-10">
            <div className="flex justify-between items-center mb-4">
                <span>Page Clients</span>
                <Button variant={"outline"} onClick={handleOpen}>
                    Ajouter un client
                </Button>
            </div>
            
            <Modal open={isOpen} modalTitle="Nouveau client" onClose={handleClose} >
                <div>
                    <ClientForm onClose={handleClose} onSubmit={handleSubmit} />
                </div>
            </Modal>
        </div>
    );
}