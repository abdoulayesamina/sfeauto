"use client"

import { Modal } from "@/src/shared/components/modal";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { CarFront , Loader, CheckCircle, AlertCircle, List, DiamondPlus, ArrowLeft, PlusCircle, SearchX, CheckCircle2, Wrench, Calendar, MapPin, User, Car} from "lucide-react";
import { useState } from "react";
import { AddVehiculeForm } from "./form/addVehiculeForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select";
import { Client } from "@/src/utils/types/client";
import { Agence } from "@/src/utils/types/agence";

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

    const [openCreateVehiculeModal,setOpenCreateVehiculeModal] = useState(false);
    const handleSubmitCreate = ()=>{
        setOpenCreateVehiculeModal(false)
    }
    const [vehiculeNotFound, setVehiculeNotFound] = useState(false)

    const [apercuVehiculeOpen, setApercuVehiculeOpen] = useState(false)

    return(
        <div className="h-full py-4 px-12 bg-zinc-50">
            <div className="bg-white min-h-full rounded-lg p-4">
                <span className="font-bold text-2xl">Page Gestionnaire</span>
                <div className="flex p-4 items-center justify-center mt-4 shadow rounded ">
                    <div className="flex items-center justify-center gap-2 w-full md:w-[80%] flex-col md:flex-row mx-auto">
                        <Input className="md:flex-1"/>
                        <Button onClick={()=>setVehiculeNotFound(true)} className="w-full md:w-auto">Rechercher</Button>
                    </div>
                </div>
                { !vehiculeNotFound ?
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            <Select>
                                <SelectTrigger className="h-16">
                                    <SelectValue placeholder="Trier par client" />
                                </SelectTrigger>

                                <SelectContent>
                                    {mockClients.map((client) => (
                                    <SelectItem
                                        key={client.id}
                                        value={client.id}
                                    >
                                        {client.name}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="h-16">
                                    <SelectValue placeholder="Trier par agence" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockAgences.map((agence) => (
                                    <SelectItem
                                        key={agence.id}
                                        value={agence.id}
                                    >
                                        {agence.location}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="h-16">
                                    <SelectValue placeholder="Statut du véhicule" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="CONFIRME">Confirmé</SelectItem>
                                    <SelectItem value="ATTENTE_PIECES">Attente pièces</SelectItem>
                                    <SelectItem value="EN_REPARATION">En réparation</SelectItem>
                                    <SelectItem value="TERMINE">Terminé</SelectItem>
                                    <SelectItem value="SANS_INTERVENTION">Sans intervention</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            
                            <div className="min-h-[150px] bg-blue-50 border border-blue-200 shadow rounded p-2 flex flex-col">
                                <div className="flex flex-col flex-1">
                                <div className="flex gap-3 items-center">
                                    <span><CarFront color="blue" size={25} /></span>
                                    <span className="font-bold text-lg">Total</span>
                                </div>
                                <span className="text-center w-full mt-2 text-4xl font-bold text-blue-600">10</span>
                                </div>
                                <span className="text-gray-600 text-sm">Vehicule totale</span>
                            </div>

                            <div className="min-h-[150px] bg-orange-50 border border-orange-200 shadow rounded p-2 flex flex-col">
                                <div className="flex flex-col flex-1">
                                <div className="flex gap-3 items-center">
                                    <span><Loader color="orange" size={25} /></span>
                                    <span className="font-bold text-lg">En cours</span>
                                </div>
                                <span className="text-center w-full mt-2 text-4xl font-bold text-orange-500">23</span>
                                </div>
                                <span className="text-gray-600 text-sm">Vehicule en cours</span>
                            </div>

                            <div className="min-h-[150px] bg-green-50 border border-green-200 shadow rounded p-2 flex flex-col">
                                <div className="flex flex-col flex-1">
                                <div className="flex gap-3 items-center">
                                    <span><CheckCircle color="green" size={25} /></span>
                                    <span className="font-bold text-lg">Terminé</span>
                                </div>
                                <span className="text-center w-full mt-2 text-4xl font-bold text-green-600">15</span>
                                </div>
                                <span className="text-gray-600 text-sm">Vehicule terminé</span>
                            </div>

                            <div className="min-h-[150px] bg-red-50 border border-red-200 shadow rounded p-2 flex flex-col">
                                <div className="flex flex-col flex-1">
                                <div className="flex gap-3 items-center">
                                    <span><AlertCircle color="red" size={25} /></span>
                                    <span className="font-bold text-lg">Sans int</span>
                                </div>
                                <span className="text-center w-full mt-2 text-4xl font-bold text-red-600">8</span>
                                </div>
                                <span className="text-gray-600 text-sm">Vehicule sans intervention</span>
                            </div>

                        </div>
                        <div className="mt-6 border p-3 rounded ">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold">
                                    <List  size={25} />
                                    <h1>Liste des vehicules</h1>
                                </div>
                                <div className="flex items-center gap-4 hidden lg:inline">
                                    <div className="flex items-center gap-1 text-sm tetx-gray-300">
                                        <span className="bg-yellow-400 rounded-full w-4 h-4 inline-block"></span>
                                        <span>En réparation</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm tetx-gray-300">
                                        <span className="bg-green-400 rounded-full w-4 h-4 inline-block"></span>
                                        <span>Terminé</span>
                                    </div>
                                </div>
                            </div>
                            <div className=" max-h-[500px] overflow-auto mt-4 shadow cursor-pointer">
                                <div className="border shadow mt-4 rounded p-4 flex flex-col md:flex-col lg:flex-row lg:items-center md:justify-between gap-2"
                                    onClick={()=>{
                                        setApercuVehiculeOpen(true)
                                        //initialise les data a afficher dans le modal dans un state
                                    }}
                                >

                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        <span className="font-bold text-gray-800">DDDF</span>
                                        <span className="text-gray-500 italic">Citroen Megane (2025)</span>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-3 text-gray-600 text-sm">
                                        <span>Dave DI</span>
                                        <span>· Charles de Gaulle</span>
                                        <span>· Entrée: 17/12/2025</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 md:mt-0">
                                        <span className="bg-yellow-100 text-yellow-800 font-bold text-xs px-2 py-0.5 w-full sm:w-auto rounded-lg sm:rounded-full lg:text-xl">1 <span className="inline lg:hidden">en réparation</span></span>
                                        <span className="bg-green-100 text-green-800 font-bold text-xs px-2 py-0.5 w-full sm:w-auto rounded-lg sm:rounded-full lg:text-xl">1 <span className="inline lg:hidden">terminé</span></span>
                                        <Button className="text-sm px-3 py-1 w-full  sm:w-auto" >
                                            <span><DiamondPlus /></span> Intervention
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> :
                    <div className="w-full lg:w-[70%] mt-14 mx-auto rounded-2xl border bg-white/70 backdrop-blur 
                        shadow-lg p-16 flex flex-col items-center gap-6">

                        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-50 text-red-500">
                            <SearchX size={42} />
                        </div>

                        <h1 className="text-2xl font-semibold text-zinc-800">
                            Véhicule introuvable
                        </h1>

                        <p className="text-zinc-500 text-center max-w-md">
                            Aucun véhicule ne correspond à votre recherche.
                        </p>

                        <div className="flex flex-col lg:flex-row gap-4 mt-4">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => setVehiculeNotFound(false)}
                            >
                            <ArrowLeft size={18} />
                                Revenir à la recherche
                            </Button>

                            <Button
                                className="flex items-center gap-2"
                                onClick={() => setOpenCreateVehiculeModal(true)}
                            >
                            <PlusCircle size={18} />
                                Créer un nouveau véhicule
                            </Button>
                        </div>
                    </div>
                }
            </div> 



            <Modal open={openCreateVehiculeModal} onClose={()=>setOpenCreateVehiculeModal(false)} modalTitle="Nouveau Véhicule" >
                <AddVehiculeForm mode="create" onClose={()=>setOpenCreateVehiculeModal(false)} onSubmit={()=>handleSubmitCreate} />
            </Modal>

            <Modal open={apercuVehiculeOpen} onClose={()=>setApercuVehiculeOpen(false)} modalTitle="Aperçu" >
                <div className="space-y-6 max-h-[500px] overflow-auto">

                    <div className="rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Car size={22} />
                            </div>

                            <div className="flex flex-col">
                            <span className="text-lg font-semibold text-zinc-800">
                                DDDF
                            </span>
                            <span className="text-sm text-zinc-500">
                                Citroën Megane • 2025
                            </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <User className="text-zinc-400" size={18} />
                            <div>
                            <p className="text-xs text-zinc-400">Client</p>
                            <p className="font-medium text-zinc-700">Dave DI</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <MapPin className="text-zinc-400" size={18} />
                            <div>
                            <p className="text-xs text-zinc-400">Agence</p>
                            <p className="font-medium text-zinc-700">Charles de Gaulle</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <Calendar className="text-zinc-400" size={18} />
                            <div>
                            <p className="text-xs text-zinc-400">Date d’entrée</p>
                            <p className="font-medium text-zinc-700">17/12/2025</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3">
                            <Wrench className="text-yellow-600" />
                            <div>
                            <p className="text-xs text-yellow-700">En réparation</p>
                            <p className="text-xl font-bold text-yellow-800">1</p>
                            </div>
                        </div>

                        <div className="flex-1 rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
                            <CheckCircle2 className="text-green-600" />
                            <div>
                            <p className="text-xs text-green-700">Terminé</p>
                            <p className="text-xl font-bold text-green-800">1</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-2">
                        <Button className="flex items-center gap-2">
                            <PlusCircle size={18} />
                            Nouvelle intervention
                        </Button>
                    </div>

                </div>
            </Modal>
        </div>
        
    )
}