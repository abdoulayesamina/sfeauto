import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Client } from "@/src/utils/types/client";
import { useEffect, useState } from "react";

export function ClientForm({ onClose, onSubmit, mode, data }: { onClose: () => void; onSubmit: () => void, mode : "create" | "edit", data? : Client }) {

    const [client,setClient] = useState<Client>({
        id:"",
        name:"",
        phone:"",
        email:"",
        createdAt: "",
        updatedAt : "",
        _count:{
            bases : 0,
            vehicles : 0
        }
    })

    useEffect(()=>{
        if(mode === "edit"){
            setClient(data ?? client)
        }
    },[mode,data])

    const handleSubmit = (e : React.FormEvent)=>{
        e.preventDefault();
        onSubmit();
    }


    return (
        <form  onSubmit={handleSubmit} className="">
            <div className="mb-4 flex flex-col gap-2 items-start"> 
                <Label htmlFor="name">Nom</Label>
                <Input value={client?.name} onChange={(e)=>setClient({...client, name : e.target.value})} className="h-16" id="name" type="text" placeholder="name" />
                <div className="mt-6 flex justify-end gap-4 w-full">
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button type="submit">Enregistrer</Button>
                </div>
            </div>
        </form>
    )
}