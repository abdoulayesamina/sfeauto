"use client"

import { Modal } from "@/src/shared/components/modal"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/shared/components/ui/table"
import {
  Search,
  Wrench,
  Car,
  User,
  Calendar,
  MapPin,
  Eye,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from "lucide-react"
import React from "react"
import { useState } from "react"
import InterventionDetail from "./shared/components/intervention-detail"

export const interventionsMock = [
    {
        "id": "cmja5d8su0007l804r8kzkupv",
        "accordNumber": "ACCBGH",
        "dateOfConfirmation": "2025-12-17T00:00:00.000Z",
        "status": "FIXING_STARTED",
        "statusUpdatedAt": "2026-01-07T14:28:29.247Z",
        "workDescription": "fdgfdf",
        "didOrderParts": false,
        "ordersDetails": null,
        "comments": null,
        "createdAt": "2025-12-17T15:09:12.177Z",
        "vehicle": {
            "id": "cmja56dk40001l804jjm8wyif",
            "licensePlate": "DDDF",
            "brand": "Citroen ",
            "model": "Megane",
            "year": 2025,
            "color": "gris",
            "client": {
                "id": "cmj9wlor80002kz04kgiwopk7",
                "name": "Dave DI"
            },
            "base": {
                "id": "cmj9wlzva0005jm04b2v5y7t7",
                "location": "Charles de gaule"
            }
        },
        "handledBy": {
            "name": "Dembélé Dave",
            "email": "david.dembele@samina.tech"
        },
        "statusHistory": [
            {
                "id": "cmja5f0jd0001l804v261ojak",
                "previousStatus": "CONFIRMED_IN_PLANNING",
                "newStatus": "FIXING_STARTED",
                "changedAt": "2025-12-17T15:10:34.873Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmjb9vhze0001l504z8u89n5e",
                "previousStatus": "FIXING_STARTED",
                "newStatus": "WAITING_FOR_PARTS",
                "changedAt": "2025-12-18T10:03:08.618Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmjb9wb4d0003l5047lug22fo",
                "previousStatus": "WAITING_FOR_PARTS",
                "newStatus": "FIXING_STARTED",
                "changedAt": "2025-12-18T10:03:46.382Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmjbabhpn0005l504ho8ev5om",
                "previousStatus": "FIXING_STARTED",
                "newStatus": "WAITING_FOR_PARTS",
                "changedAt": "2025-12-18T10:15:34.764Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmjbaut5u0001kv04lafajarv",
                "previousStatus": "WAITING_FOR_PARTS",
                "newStatus": "FIXING_STARTED",
                "changedAt": "2025-12-18T10:30:36.066Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmjbauvt20003kv04ft21cu3z",
                "previousStatus": "FIXING_STARTED",
                "newStatus": "WAITING_FOR_PARTS",
                "changedAt": "2025-12-18T10:30:39.494Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmjbav4se0005kv04am597lrf",
                "previousStatus": "WAITING_FOR_PARTS",
                "newStatus": "FIXING_STARTED",
                "changedAt": "2025-12-18T10:30:51.134Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmk445f3i0001l104idwy76fw",
                "previousStatus": "FIXING_STARTED",
                "newStatus": "WAITING_FOR_PARTS",
                "changedAt": "2026-01-07T14:28:12.846Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmk445hds0003l104nljz1kri",
                "previousStatus": "WAITING_FOR_PARTS",
                "newStatus": "FIXING_STARTED",
                "changedAt": "2026-01-07T14:28:15.808Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmk445nan0005l104xyudfm98",
                "previousStatus": "FIXING_STARTED",
                "newStatus": "WAITING_FOR_PARTS",
                "changedAt": "2026-01-07T14:28:23.472Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            },
            {
                "id": "cmk445roh0007l104iz0lz0na",
                "previousStatus": "WAITING_FOR_PARTS",
                "newStatus": "FIXING_STARTED",
                "changedAt": "2026-01-07T14:28:29.153Z",
                "changedBy": {
                    "name": "Cissé abdoulaye"
                }
            }
        ]
    },
]

const STATUS_TRANSLATIONS: Record<string, string> = {
  CONFIRMED_IN_PLANNING: "Confirmée et planifiée",
  FIXING_STARTED: "Réparation en cours",
  WAITING_FOR_PARTS: "En attente de pièces",
  FIXING_DONE: "Réparation terminée",
  CANCELLED: "Annulée",
}

export const statusStyles: Record<string, string> = {
  FIXING_STARTED: "bg-blue-100 text-blue-700",
  WAITING_FOR_PARTS: "bg-orange-100 text-orange-700",
  FIXING_DONE: "bg-green-100 text-green-700",
}

export const getStatusMeta = (status?: string) => {
    switch (status) {
        case "FIXING_STARTED":
        return {
            label: "Réparation en cours",
            icon: Wrench,
            color: "text-blue-700",
            bg: "bg-blue-100",
        }

        case "WAITING_FOR_PARTS":
        return {
            label: "En attente de pièces",
            icon: Clock,
            color: "text-orange-700",
            bg: "bg-orange-100",
        }

        case "FIXING_DONE":
        return {
            label: "Réparation terminée",
            icon: CheckCircle2,
            color: "text-green-700",
            bg: "bg-green-100",
        }

        case "CANCELLED":
        return {
            label: "Annulée",
            icon: XCircle,
            color: "text-red-700",
            bg: "bg-red-100",
        }

        default:
        return {
            label: "Statut inconnu",
            icon: AlertTriangle,
            color: "text-gray-600",
            bg: "bg-gray-100",
        }
    }
}

export const translateStatus = (status?: string): string => {
    if (!status) return "Statut inconnu"
    return STATUS_TRANSLATIONS[status] ?? status
}

export default function MecanicienPage() {
    const [filterStatus, setFilterStatus] = useState("FIXING_STARTED")
    const [open, setOpen] = useState(false)
    const [selectedIntervention, setSelectedIntervention] = useState<any>(null)

        
    const openModal = (intervention: any) => {
        setSelectedIntervention(intervention)
        setOpen(true)
    }

    

    return (
        <div className="bg-zinc-50 min-h-screen p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">

            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Wrench />
                </div>
                <h1 className="text-2xl font-bold">Espace Mécanicien</h1>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Trier par client" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Trier par agence" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="agence">Agence</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Input placeholder="Rechercher..." className="w-full sm:w-[250px]" />
                    <Button size="icon" variant="outline">
                        <Search size={18} />
                    </Button>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={() => setFilterStatus("FIXING_STARTED")}
                    variant={filterStatus === "FIXING_STARTED" ? "default" : "outline"}
                >
                    En cours
                </Button>
                <Button
                    onClick={() => setFilterStatus("FIXING_DONE")}
                    variant={filterStatus === "FIXING_DONE" ? "default" : "outline"}
                >
                    Terminées
                </Button>
            </div>

            <div className="space-y-4">
            {interventionsMock
                .filter(i => i.status === "FIXING_STARTED")
                .map(intervention => (
                    <div
                        key={intervention.id}
                        className="border rounded-xl p-5 flex flex-col gap-4 lg:flex-row lg:items-center hover:shadow-md transition"
                    >
                        <div className="flex items-start gap-3 flex-1">
                            <Car className="text-gray-400 mt-1" />
                            <div>
                                <p className="font-bold">{intervention.vehicle.licensePlate}</p>
                                <p className="text-sm text-gray-500">
                                {intervention.vehicle.licensePlate}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 flex-1">
                            <Calendar className="text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium">{intervention.accordNumber}</p>
                                <p className="text-sm text-gray-500">
                                {new Date(intervention.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 flex-1">
                            <User className="text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium">{intervention.handledBy.name}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin size={14} />
                                {intervention.vehicle.base.location}
                                </p>
                            </div>
                        </div>

                        <span
                        >
                            <Select >
                                <SelectTrigger  className={`w-full sm:w-[180px] ${statusStyles[filterStatus]}`}>
                                    <SelectValue placeholder="Changer de status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="En_COURS">En Cours</SelectItem>
                                    <SelectItem value="EN_ATTENTE">En entente de pièces</SelectItem>
                                    <SelectItem value="TERMINE">Réparation terminé</SelectItem>
                                </SelectContent>
                            </Select>
                        </span>

                        <Button variant="outline" className="gap-2" onClick={() => openModal(interventionsMock[0])} >
                            <Eye size={16} />
                            Détails
                        </Button>
                    </div>
                ))}
            </div>
        </div>

            <Modal open={open} onClose={() => setOpen(false)} modalDescription="Détail de l’intervention">
                <InterventionDetail
                    selectedIntervention={selectedIntervention}
                    onClose={()=>setOpen(false)}
                    getStatusMeta={getStatusMeta}
                    translateStatus={translateStatus}
                />
            </Modal>

        </div>
    )
}


