"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Button } from "@/src/shared/components/ui/button";
import { useEffect, useState } from "react";
import { Agence } from "@/src/utils/types/agence";
export function AgenceForm({ onClose, onSubmit, mode, data }: { onClose: () => void; onSubmit: () => void, mode: 'create' | 'edit', data?: any }) {
    // une liste de client fictifs avec id et nom
    const clients = [
        { id: 1, name: "Client A" },
        { id: 2, name: "Client B" },
        { id: 3, name: "Client C" }
    ];



    const [agence, setAgence] = useState<Agence>({
        id: '',
        location: '',
        clientId: '',
        createdAt: '',
        updatedAt: '',
        client: { name: '' },
        _count: { vehicles: 0 }
    });

    useEffect(() => {
        if (mode === 'edit' && data) {
            setAgence(data);
        }
    }, [mode, data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    }

    return (
        <form className="">
            <div className="mb-4 flex flex-col gap-2 items-start">
                <Label htmlFor="c">Client</Label>
                <Select value={agence?.clientId || (data?.clientId ?? "")} onValueChange={(value) => setAgence({ ...agence, clientId: value })}>
                    <SelectTrigger className="w-[100%] !h-16">
                        <SelectValue placeholder="Selectionnez un client" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients && clients.length > 0 && 
                            clients.map( client => (
                                <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>
            <div className="mb-4 flex flex-col gap-2 items-start">
                <Label htmlFor="location">Emplacement</Label>
                <Input className="h-16" id="location" type="text" placeholder="location" value={agence.location} onChange={(e) => setAgence({ ...agence, location: e.target.value })} />
                <div className="mt-6 flex justify-end gap-4 w-full">
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit} type="submit">Enregistrer</Button>
                </div>
            </div>
        </form>
    )
}