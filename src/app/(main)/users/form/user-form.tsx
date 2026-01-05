"use client"

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select";
import { User } from "@/src/utils/types/user";
import { useEffect, useState } from "react";

export function UserForm({ onClose, onSubmit, mode, data }: { onClose: () => void; onSubmit: () => void; mode: 'create' | 'edit'; data?: User  }) {
    const roles = [
        { id: 1, name: "Administrateur" },
        { id: 2, name: "Gestionnaire" },
        { id: 3, name: "Mécanicien" },
        { id: 4, name: "Client" }
    ];

    const clients = [
        { id: 1, name: "Client A" },
        { id: 2, name: "Client B" },
        { id: 3, name: "Client C" }
    ];

    const agences = [
        { id: 1, name: "Agence X" },
        { id: 2, name: "Agence Y" },
        { id: 3, name: "Agence Z" }
    ];

    
    const [user,setUser] = useState<User>({
        id: '',
        name: '',
        email: '',
        password: '',
        role: '',
        clientId: '',
        baseId: '',
        client: null,
        base: null,
        createdAt: '',
        updatedAt: ''
    });
    
    useEffect(() => {
        if (mode === 'edit' && data) {
            setUser(data);
        }
    }, [mode, data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    }

    
    return (
        <form className="">
            <div className="mb-4 flex flex-col gap-2 items-start">
                <Label htmlFor="name">Nom</Label>
                <Input className="h-16" id="name" type="text" placeholder="name" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} />
            </div>
            <div className="mb-4 flex flex-col gap-2 items-start">
                <Label htmlFor="email">Email</Label>
                <Input className="h-16" id="email" type="text" placeholder="email" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} />
            </div>
            <div className="mb-4 flex flex-col gap-2 items-start">
                <Label htmlFor="password">Mot de passe</Label>
                <Input className="h-16" id="password" type="text" placeholder="password" value={user.password} onChange={(e) => setUser({...user, password: e.target.value})} />
            </div>
            <div className="mb-4 flex flex-col gap-2 items-start">
                <Label htmlFor="role">Rôle</Label>
                <Select value={user.role} onValueChange={(value) => setUser({...user, role: value})}>
                    <SelectTrigger className="w-[100%] !h-16">
                        <SelectValue placeholder="Selectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles && roles.length > 0 && 
                            roles.map( role => (
                                <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>
            <div className="mb-4 flex flex-col gap-2 items-start">
                <Label htmlFor="role">Client</Label>
                <Select value={user.clientId || ""} onValueChange={(value) => setUser({...user, clientId: value})}>
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
                <Label htmlFor="role">Agence</Label>
                <Select value={user.baseId || ""} onValueChange={(value) => setUser({...user, baseId: value})}>
                    <SelectTrigger className="w-[100%] !h-16">
                        <SelectValue placeholder="Selectionnez une agence" />
                    </SelectTrigger>
                    <SelectContent>
                        {agences && agences.length > 0 && 
                            agences.map( agence => (
                                <SelectItem key={agence.id} value={agence.id.toString()}>{agence.name}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>
            <div className="mt-6 flex justify-end gap-4 w-full">
                <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit} type="submit">Enregistrer</Button>
            </div>
        </form>
    )
}