"use client"

import React, { useEffect } from "react";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { createPortal } from "react-dom";


type ModalProps = {
    open?: boolean;
    modalTitle?: string;
    modalDescription?: string;
    children: React.ReactNode;
    onClose: () => void;
    className?: string

}

export function Modal({ open, modalTitle, modalDescription, children, onClose }: ModalProps) {

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [open])

    if (!open) return null

    return createPortal(
        <div className="fixed flex items-center justify-center inset-0 z-[1000]">

            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer z-[1000]"
                onClick={onClose}
            />

            <div className="z-[1001] h-[100%] flex items-center justify-center w-full p-10">
                <div
                    className="bg-white rounded-xl shadow-xl px-6 pb-6 max-h-[95%] overflow-auto md:min-w-[600px] min-w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-end pb-1">
                        <Button
                            onClick={onClose}
                            className="rounded-sm hover:opacity-100 z-50 bg-white mt-2"
                            variant="ghost"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="p-2">
                        <h1 className="text-xl font-bold">{modalTitle}</h1>
                        <span className="text-sm text-gray-500 "> {modalDescription}</span>
                    </div>
                    <div >
                        {children}
                    </div>

                </div>
            </div>
        </div>,
        document.body
    )


    // return (
    //     <Dialog open={open} >
    //         <DialogContent className="max-h-[90%] overflow-auto w-full max-w-[700px]" >
    //             <DialogHeader className="relative">
    //                 <Button
    //                     onClick={onClose}
    //                     className="absolute -right-5 -top-4 rounded-sm hover:opacity-100 z-50 bg-white"
    //                     variant="ghost"
    //                 >
    //                     <X className="h-4 w-4" />
    //                 </Button>
    //                 <DialogTitle>{modalTitle}</DialogTitle>
    //                 <DialogDescription>
    //                     {modalDescription}
    //                 </DialogDescription>
    //             </DialogHeader>
    //             <div>
    //                 {children}
    //             </div>
    //         </DialogContent>
    //     </Dialog>
    // )
}
