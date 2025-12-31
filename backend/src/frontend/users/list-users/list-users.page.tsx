"use client"

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/modal";
import { useState } from "react";

export default function ListUsersPage() {
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
                Open Modal
            </Button>
            <Modal open={isOpen} modalTitle="Edit profile" modalDescription="Make changes to your profile here. Click save when youre done." onClose={handleClose} onSubmit={handleSubmit} >
                <div className="grid gap-4">
                    {/* <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="username-1">Username</Label>
                        <Input id="username-1" name="username" defaultValue="@peduarte" />
                    </div> */}
                </div>
            </Modal>
        </div>
    );
}