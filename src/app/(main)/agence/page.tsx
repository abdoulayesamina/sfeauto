"use client"

import { Button } from "@/src/shared/components/ui/button"; 
import { Modal } from "@/src/shared/components/modal";
import { useState } from "react";
import { AgenceForm } from "./form/agence-form";

export default function AgencePage() {
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
        <div className="flex min-h-full bg-zinc-50 max-h-full items-center justify-center font-sans dark:bg-black rounded-lg">
            <Button variant={"outline"} onClick={handleOpen}>
                Ajouter une agence
            </Button>
            <Modal open={isOpen} modalTitle="Nouvelle agence" onClose={handleClose} >
                <div>
                    <AgenceForm onClose={handleClose} onSubmit={handleSubmit} />
                </div>
            </Modal>
        </div>
    );
}