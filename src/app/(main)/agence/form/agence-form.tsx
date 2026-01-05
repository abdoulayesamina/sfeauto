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
export function AgenceForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
    // une liste de client fictifs avec id et nom
    const clients = [
        { id: 1, name: "Client A" },
        { id: 2, name: "Client B" },
        { id: 3, name: "Client C" }
    ];

    return (
        <form className="">
            <div className="mb-4 flex flex-col gap-2 items-start">
                <Label htmlFor="c">Client</Label>
                <Select>
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
                <Input className="h-16" id="location" type="text" placeholder="location" />
                <div className="mt-6 flex justify-end gap-4 w-full">
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={onSubmit} type="submit">Enregistrer</Button>
                </div>
            </div>
        </form>
    )
}