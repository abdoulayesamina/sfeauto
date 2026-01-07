import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Vehicule } from "@/src/utils/types/vehicule";
import { useEffect, useState } from "react";

export function AddVehiculeForm({ onClose, onSubmit, mode, data }: { onClose: () => void; onSubmit: () => void, mode : "create" | "edit", data? : Vehicule }){
    
    const [vehicule, setVehicule] = useState<Vehicule>({
        baseId: "",
        clientId: "",
        licensePlate: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
    })

    useEffect(() => {
        if (mode === "edit" && data) {
            setVehicule(data)
        }
    }, [mode, data])

    const handleSubmit = (e : React.FormEvent)=>{
        e.preventDefault();
        onSubmit();
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
                <Label htmlFor="immatriculation">
                    Immatriculation <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="immatriculation"
                    placeholder="SSSSDDDD"
                    className="h-16"
                    value={vehicule.licensePlate}
                    onChange={(e) =>
                        setVehicule({ ...vehicule, licensePlate: e.target.value })
                    }
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="marque">Marque</Label>
                    <Input
                        id="marque"
                        placeholder="Renault"
                        className="h-16"
                        value={vehicule.brand}
                        onChange={(e) =>
                        setVehicule({ ...vehicule, brand: e.target.value })
                        }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="modele">Modèle</Label>
                    <Input
                        id="modele"
                        placeholder="Megane"
                        className="h-16"
                        value={vehicule.model}
                        onChange={(e) =>
                        setVehicule({ ...vehicule, model: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Année / Couleur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="annee">Année</Label>
                    <Input
                        id="annee"
                        type="number"
                        placeholder="2023"
                        className="h-16"
                        value={vehicule.year}
                        onChange={(e) =>
                            setVehicule({ ...vehicule, year: Number(e.target.value) })
                        }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="couleur">Couleur</Label>
                    <Input
                        id="couleur"
                        placeholder="Gris"
                        className="h-16"
                        value={vehicule.color}
                        onChange={(e) =>
                            setVehicule({ ...vehicule, color: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Client */}
            <div className="flex flex-col gap-2">
                <Label>
                    Client <span className="text-red-500">*</span>
                </Label>
                <select
                    className="h-16 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={vehicule.clientId}
                    onChange={(e) =>
                        setVehicule({ ...vehicule, clientId: e.target.value })
                    }
                >
                <option value="">Sélectionner un client</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <Label>
                    Agence <span className="text-red-500">*</span>
                </Label>
                <select
                    disabled={!vehicule.clientId}
                    className="h-16 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                    value={vehicule.baseId}
                    onChange={(e) =>
                        setVehicule({ ...vehicule, baseId: e.target.value })
                    }
                >
                    <option value="">Sélectionner d'abord un client</option>
                </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={onClose}
                >
                    Annuler
                </Button>

                <Button type="submit" className="w-full sm:w-auto">
                    {mode === "edit" ? "Mettre à jour" : "Créer le véhicule"}
                </Button>
            </div>
        </form>
    );
}
