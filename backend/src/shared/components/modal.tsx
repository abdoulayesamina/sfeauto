
import { Button } from "@/src/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/shared/components/ui/dialog"
import { X } from "lucide-react";


type ModalProps = {
  open?: boolean;
  modalTitle?: string;
  modalDescription?: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
}

export function Modal({open, modalTitle, modalDescription, children, onClose , onSubmit}: ModalProps) {

    const handleSubmit = () => {
        onSubmit();
    }

    return (
        <Dialog open={open} >
            <DialogContent >
                <DialogHeader className="relative">
                    <Button
                        onClick={onClose}
                        className="absolute -right-5 -top-4 rounded-sm opacity-70 hover:opacity-100 z-50"
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
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
