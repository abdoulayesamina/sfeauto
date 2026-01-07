"use client"

import { Modal } from "@/src/shared/components/modal";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { CarFront , Loader, CheckCircle, AlertCircle, List, DiamondPlus, ArrowLeft, PlusCircle, SearchX, CheckCircle2, Wrench, Calendar, MapPin, User, Car} from "lucide-react";
import { useState } from "react";
import { AddVehiculeForm } from "./form/add-vehicule-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select";
import { Client } from "@/src/utils/types/client";
import { Agence } from "@/src/utils/types/agence";
import { Vehicule } from "@/src/utils/types/vehicule";
import { Span } from "next/dist/trace";
import { VehicleFilters } from "./shared/components/vehicle-filters";
import { VehicleListAll } from "./shared/components/vehicle-list-all";
import { VehicleListByAgence } from "./shared/components/vehicle-list-by-agence";
import { VehicleSearchBar } from "./shared/components/vehicle-search-bar";
import { VehicleStats } from "./shared/components/vehicule-stats";
import { VehicleListCard } from "./shared/components/vehicle-list-card";
import { VehicleNotFound } from "./vehicle-not-found";
import { VehiclePreview } from "./shared/components/vehicle-apercu";

export default function GestionnairePage(){

    const mockClients: Client[] = [
        {
            id: "cl_001",
            name: "Garage Central Bamako",
            email: "contact@garage-bko.ml",
            phone: "+22370000001",
            createdAt: "2025-01-01T10:00:00.000Z",
            updatedAt: "2025-01-10T15:30:00.000Z",
            _count: {
            bases: 2,
            vehicles: 14,
            },
        },
        {
            id: "cl_002",
            name: "Auto Services Kalaban",
            email: "autoservices@kalaban.ml",
            phone: "+22370000002",
            createdAt: "2025-01-03T09:00:00.000Z",
            updatedAt: "2025-01-12T12:00:00.000Z",
            _count: {
            bases: 1,
            vehicles: 6,
            },
        },
        {
            id: "cl_003",
            name: "Fleet Pro Mali",
            email: null,
            phone: null,
            createdAt: "2025-01-05T14:00:00.000Z",
            updatedAt: "2025-01-15T18:45:00.000Z",
            _count: {
            bases: 3,
            vehicles: 27,
            },
        },
    ]
    const mockAgences: Agence[] = [
        {
            id: "ag_001",
            location: "Hamdallaye ACI 2000",
            clientId: "cl_001",
            client: {
            name: "Garage Central Bamako",
            },
            createdAt: "2025-01-02T08:30:00.000Z",
            updatedAt: "2025-01-12T16:10:00.000Z",
            _count: {
            vehicles: 8,
            },
        },
        {
            id: "ag_002",
            location: "Kalaban Coura Sud",
            clientId: "cl_002",
            client: {
            name: "Auto Services Kalaban",
            },
            createdAt: "2025-01-04T10:15:00.000Z",
            updatedAt: "2025-01-14T11:45:00.000Z",
            _count: {
            vehicles: 5,
            },
        },
        {
            id: "ag_003",
            location: "Sotuba ACI",
            clientId: "cl_003",
            client: {
            name: "Fleet Pro Mali",
            },
            createdAt: "2025-01-06T13:00:00.000Z",
            updatedAt: "2025-01-16T17:20:00.000Z",
            _count: {
            vehicles: 12,
            },
        },
    ]

    const mockVehicules: Vehicule[] = [
        {
            baseId: "ag_001",
            clientId: "cl_001",
            licensePlate: "DK-2345-AB",
            brand: "Citroën",
            model: "Megane",
            year: 2025,
            color: "Gris",
        },
        {
            baseId: "ag_002",
            clientId: "cl_002",
            licensePlate: "BG-9087-CD",
            brand: "Toyota",
            model: "Hilux",
            year: 2023,
            color: "Blanc",
        },
        {
            baseId: "ag_003",
            clientId: "cl_003",
            licensePlate: "AA-1122-EF",
            brand: "Peugeot",
            model: "308",
            year: 2024,
            color: "Noir",
        },
    ]

    const [openCreateVehiculeModal,setOpenCreateVehiculeModal] = useState(false);
    const handleSubmitCreate = ()=>{
        setOpenCreateVehiculeModal(false)
    }
    const [vehiculeNotFound, setVehiculeNotFound] = useState(false)

    const [apercuVehiculeOpen, setApercuVehiculeOpen] = useState(false)
    const [filterByAllVehicule,setFilterByAllVehicule] = useState(false)

    return(
        <div className="h-full py-4 px-12 bg-zinc-50">
            <div className="bg-white min-h-full rounded-lg p-4">
                <span className="font-bold text-2xl">Page Gestionnaire</span>
                <VehicleSearchBar onSearch={() => setVehiculeNotFound(true)} />

                { !vehiculeNotFound ?
                    <div>
                        <div className="flex items-center gap-2 py-3">
                            <Button variant={filterByAllVehicule ? "default" : "outline"} onClick={()=>setFilterByAllVehicule(true)}>Tous les véhicules</Button>
                            <Button variant={filterByAllVehicule ? "outline" : "default"} onClick={()=>setFilterByAllVehicule(false)}>Par Agence</Button>
                        </div>
                        <VehicleFilters agences={mockAgences} clients={mockClients} />
                        <VehicleStats total={80} enCours={23} termine={15} sansIntervention={8} />
                        <VehicleListCard
                            filterByAllVehicule={filterByAllVehicule}
                            vehicles={mockVehicules}
                            clients={mockClients}
                            agences={mockAgences}
                            onSelect={() => setApercuVehiculeOpen(true)}
                        />
                    </div> :
                     <VehicleNotFound
                        onBack={() => setVehiculeNotFound(false)}
                        onCreate={() => setOpenCreateVehiculeModal(true)}
                    />
                }
            </div> 



            <Modal open={openCreateVehiculeModal} onClose={()=>setOpenCreateVehiculeModal(false)} modalTitle="Nouveau Véhicule" >
                <AddVehiculeForm mode="create" onClose={()=>setOpenCreateVehiculeModal(false)} onSubmit={()=>handleSubmitCreate} />
            </Modal>

            <Modal open={apercuVehiculeOpen} onClose={()=>setApercuVehiculeOpen(false)} modalTitle="Aperçu" >
                <div className="space-y-6 max-h-[500px] overflow-auto">

                    <VehiclePreview
                        licensePlate="DDDF"
                        brand="Citroën"
                        model="Megane"
                        year={2025}
                        client="Dave DI"
                        agence="Charles de Gaulle"
                        entreeDate="17/12/2025"
                        enReparation={1}
                        termine={1}
                        onNewIntervention={() => console.log("Nouvelle intervention")}
                    />

                </div>
            </Modal>
        </div>
        
    )
}