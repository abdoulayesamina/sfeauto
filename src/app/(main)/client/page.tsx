"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import {
  Search,
  Wrench,
  Car,
  User,
  Calendar,
  MapPin,
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useState } from "react"
import { VehicleStats } from "../gestionnaire/shared/components/vehicule-stats"
import { Intervention } from "@/src/utils/types/intervention"
import { Modal } from "@/src/shared/components/modal"
import { getStatusMeta, interventionsMock, statusStyles, translateStatus } from "../mecanicien/page"
import InterventionDetail from "../mecanicien/shared/components/intervention-detail"

const mockVehicule = {
  baseId: "base_001",
  id: "veh_001",
  clientId: "client_123",
  licensePlate: "AB-123-CD",
  brand: "Toyota",
  model: "Corolla",
  year: 2021,
  color: "Noir",
}

// const interventionsMock: Intervention[] = [
//   {
//     id: "int_001",
//     accordNumber: "ACC-2024-001",
//     dateOfConfirmation: "2024-06-01T10:00:00Z",
//     status: "TERMINEE",
//     statusUpdatedAt: "2024-06-01T10:00:00Z",
//     workDescription: "Vidange moteur et remplacement du filtre à huile",
//     didOrderParts: false,
//     ordersDetails: null,
//     comments: null,
//     createdAt: "2024-05-31T16:30:00Z",

//     vehicle: mockVehicule,

//     handledBy: {
//       location: "Agence Bamako Centre",
//     },

//     statusHistory: [],
//   },
//   {
//     id: "int_002",
//     accordNumber: "ACC-2024-002",
//     dateOfConfirmation: "2024-08-15T09:15:00Z",
//     status: "EN_COURS",
//     statusUpdatedAt: "2024-08-16T11:45:00Z",
//     workDescription: "Changement plaquettes de frein avant",
//     didOrderParts: true,
//     ordersDetails: {
//       supplier: "AutoParts Mali",
//       reference: "BRK-PLA-789",
//     },
//     comments: "Client demande un contrôle général",
//     createdAt: "2024-08-14T14:10:00Z",

//     vehicle: mockVehicule,

//     handledBy: {
//       location: "Agence Bamako Centre",
//     },

//     statusHistory: [],
//   },
//   {
//     id: "int_003",
//     accordNumber: "ACC-2024-003",
//     dateOfConfirmation: "2024-11-03T08:40:00Z",
//     status: "TERMINEE",
//     statusUpdatedAt: "2024-11-04T17:20:00Z",
//     workDescription: "Remplacement batterie",
//     didOrderParts: true,
//     ordersDetails: {
//       supplier: "Energie Auto",
//       reference: "BAT-12V-60AH",
//     },
//     comments: null,
//     createdAt: "2024-11-02T15:55:00Z",

//     vehicle: mockVehicule,

//     handledBy: {
//       location: "Agence Bamako Nord",
//     },

//     statusHistory: [],
//   },
// ]



export default function ClientPage() {
    const [filterStatus, setFilterStatus] = useState("FIXING_STARTED")
    const [openInterventionModal,setOpenInterventionModal] = useState(false);
    const [openDetailModal,setOpenDetailModal] = useState(false);
    const [interventionsVehicule,setInterventionVehicule] = useState<any>(null)

    const handleViewInterventions = () => {
        setOpenInterventionModal(true)
    }

    const handleViewDetails = (interventions : any) => {
        setInterventionVehicule(interventions)
        setOpenDetailModal(true)
    }

    return (
        <div className="bg-zinc-50 min-h-screen p-4 sm:p-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <User />
                    </div>
                    <h1 className="text-2xl font-bold">Espace Client</h1>
                </div>

                <div>
                    <div className="flex items-center gap-2 sm:max-w-[90%] sm:mx-auto">
                        <Input placeholder="Rechercher..." className="h-14 flex-1 " />
                        <Button size="icon" variant="outline">
                            <Search size={18} />
                        </Button>
                    </div>
                </div>
                <VehicleStats total={3} enCours={1} termine={1} sansIntervention={1} />

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
                {!openInterventionModal ? 
                    <div className="space-y-4">
                        {interventionsMock
                        .filter(i => i.status === filterStatus)
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
                                            {intervention.vehicle.brand}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 flex-1">
                                    <Calendar className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="font-medium">{intervention.handledBy.name}</p>
                                        <p className="text-sm text-gray-500">
                                        {new Date(intervention.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <span
                                className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${statusStyles[intervention.status]}`}
                                >
                                    2 {translateStatus(intervention.status)}
                                </span>

                                <Button variant="outline" className="gap-2" onClick={()=>handleViewInterventions()}>
                                    <Eye size={16} />
                                    Détails
                                </Button>
                            </div>
                        ))}
                    </div> :

                    <div className="space-y-6 max-h-[400px] overflow-auto p-4 shadow-xl border rounded-lg">
                        <div className="flex justify-end">
                            <Button onClick={()=>setOpenInterventionModal(false)}>Fermer</Button>
                        </div>
                        {interventionsMock.map((intervention) => {
                            const statusMeta = getStatusMeta(intervention.status)
                            const Icon = statusMeta.icon
                            return (
                                <div
                                    key={intervention.id}
                                    className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition bg-white"
                                >
                                    <div className="mb-4">
                                        <p className="font-bold text-lg">
                                            {intervention.vehicle.licensePlate}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {intervention.vehicle.brand} {intervention.vehicle.model} (
                                            {intervention.vehicle.year})
                                        </p>

                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                            <span>
                                            <strong>Couleur :</strong> {intervention.vehicle.color}
                                            </span>
                                            <span>
                                            <strong>Agence :</strong> {intervention.vehicle.base.location}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border rounded-xl p-4 bg-gray-50">

                                        <div className="flex justify-between items-center mb-3">
                                            <p className="font-semibold">{intervention.accordNumber}</p>

                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                Confirmé le{" "}
                                                {new Date(
                                                    intervention.dateOfConfirmation
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div
                                            className={`flex items-center gap-2 text-sm font-medium ${statusMeta.color} ${statusMeta.bg} px-3 py-1 rounded-full w-fit mb-2`}
                                        >
                                            <Icon />
                                            {statusMeta.label}
                                        </div>

                                        <p className="text-xs text-gray-500 mb-3">
                                            Mis à jour :{" "}
                                            {new Date(intervention.statusUpdatedAt).toLocaleString()}
                                        </p>

                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Travaux :
                                            </p>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {intervention.workDescription}
                                            </p>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                className="flex items-center gap-2 text-sm font-medium"
                                                onClick={() =>handleViewDetails(intervention)}
                                            >
                                                <Eye size={16} />
                                                Afficher détail
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
            
            <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)} modalDescription="Détail de l’intervention">
                <InterventionDetail
                    selectedIntervention={interventionsVehicule}
                    onClose={()=>setOpenDetailModal(false)}
                    getStatusMeta={getStatusMeta}
                    translateStatus={translateStatus}
                />
            </Modal>

        </div>
    )
}


