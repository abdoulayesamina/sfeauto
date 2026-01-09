import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";


type ModalProps = {
  open?: boolean;
  modalTitle?: string;
  modalDescription?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({open, modalTitle, modalDescription, children, onClose }: ModalProps) {

    return (
        <Dialog open={open}>
            <DialogContent className="max-h-[90%] overflow-auto w-full max-w-[600px]" >
                <DialogHeader className="relative">
                    <Button
                        onClick={onClose}
                        className="absolute -right-5 -top-4 rounded-sm hover:opacity-100 z-50 bg-white"
                        variant="ghost"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <DialogTitle>{modalTitle}</DialogTitle>
                    <DialogDescription>
                        {modalDescription}
                    </DialogDescription>
                </DialogHeader>
                <div>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}
