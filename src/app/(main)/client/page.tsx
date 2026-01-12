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
import InterventionDetail from "../mecanicien/shared/components/intervention-detail"
import { getStatusMeta, statusStyles, translateStatus } from "../mecanicien/page"

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



export default function ClientPage() {
    const [filterStatus, setFilterStatus] = useState("FIXING_STARTED")
    const [openInterventionModal,setOpenInterventionModal] = useState(false);
    const [openDetailModal,setOpenDetailModal] = useState(false);
    const [interventionsVehicule,setInterventionVehicule] = useState<any>(null)
    const [vehiculeSelect, SetVehiculeSelect] = useState<any>();

    const handleViewInterventions = (v:any) => {
        setOpenInterventionModal(true)
        SetVehiculeSelect(v);
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

                <div className="flex gap-2 flex-col sm:flex-row">
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

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="sm:w-[220px] ">
                      <SelectValue placeholder="Tous les statuts"/>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="ALL">Tous les statuts</SelectItem>
                      <SelectItem value="CONFIRME">Confirmé</SelectItem>
                      <SelectItem value="ATTENTE_PIECES">Attente pièces</SelectItem>
                      <SelectItem value="EN_REPARATION">En réparation</SelectItem>
                      <SelectItem value="TERMINE">Terminé</SelectItem>
                      <SelectItem value="SANS_INTERVENTION">Sans intervention</SelectItem>
                    </SelectContent>
                  </Select>
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

                          <Button variant="outline" className="gap-2" onClick={()=>handleViewInterventions(intervention.vehicle)}>
                            <Eye size={16} />
                            Détails
                          </Button>
                        </div>
                      ))}
                    </div> :

                    <div className="space-y-6 p-4 shadow-xl border rounded-lg">
                      <div>
                        <div className="flex justify-end">
                          <Button onClick={()=>setOpenInterventionModal(false)}>Fermer</Button>
                        </div>
                        <div className="mb-4 px-4 ">
                          <p className="font-bold text-lg">
                            {vehiculeSelect.licensePlate}
                          </p>
                          <p className="text-sm text-gray-500">
                            {vehiculeSelect.brand} {vehiculeSelect.model} (
                            {vehiculeSelect.year})
                          </p>

                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span>
                            <strong>Couleur :</strong> {vehiculeSelect.color}
                            </span>
                            <span>
                            <strong>Agence :</strong> {vehiculeSelect.base.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="max-h-[400px] overflow-auto ">
                        {/* Possibilité de filtrer par rapport au filtre "filterStatus"  */}
                        {interventionsMock.map((intervention) => {
                            const statusMeta = getStatusMeta(intervention.status)
                            const Icon = statusMeta.icon
                            return (
                              <div
                                key={intervention.id}
                                className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition bg-white"
                              >
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


