"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Invoice } from "@/src/utils/types/invoice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Car, Calendar, User, Eye, Search } from "lucide-react"
import { VehicleStats } from "../gestionnaire/shared/components/vehicule-stats"
import { Modal } from "@/src/shared/components/modal"
import InterventionDetail from "../mecanicien/shared/components/intervention-detail"
import { useVehiculesApi } from "./shared/useVehicules.api"
import {
  toUIStatus,
  filterByUIStatus,
} from "@/src/utils/constants/intervention-status"
import InterventionDetailClient from "./components/detailsInterv"

const statusStyles: Record<string, string> = {
  EN_COURS: "bg-blue-100 text-blue-700",
  ATTENTE_PIECES: "bg-orange-100 text-orange-700",
  TERMINEE: "bg-green-100 text-green-700",
}

export default function ClientPage() {
  const { getVehicules } = useVehiculesApi()

  const [vehicles, setVehicles] = useState<any[]>([])
  const [interventionsVehicule, setInterventionVehicule] = useState<any[]>([])
  const [vehiculeSelect, setVehiculeSelect] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<"ALL" | "EN_COURS" | "TERMINEE" | "ATTENTE_PIECES">("ALL")
  const [openInterventionModal, setOpenInterventionModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)

  // Récupération des véhicules et interventions
  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        const data = await getVehicules()
        setVehicles(data.vehicles)
      } catch (err: any) {
        console.error("Erreur récupération véhicules :", err.message)
      }
    }
    fetchVehicules()
  }, [])

  // Ouvre le modal d’un véhicule et récupère ses interventions
  const handleViewInterventions = (v: any) => {
    setVehiculeSelect(v)
    setInterventionVehicule(Array.isArray(v.invoices) ? v.invoices : [])
    setOpenInterventionModal(true)
  }

  const handleViewDetails = (intervention: any, vehicle?: any) => {
    setInterventionVehicule([{ ...intervention, vehicle }])
    setOpenDetailModal(true)
  }


  // Statistiques
  const stats = {
    total: vehicles.length,
    enCours: vehicles.filter(v => Array.isArray(v.invoices) && v.invoices.some((i: Invoice) => toUIStatus(i.status) === "EN_COURS")).length,
    termine: vehicles.filter(v => Array.isArray(v.invoices) && v.invoices.every((i: Invoice)=> toUIStatus(i.status) === "TERMINEE") && v.invoices.length > 0).length,
    sansIntervention: vehicles.filter(v => !Array.isArray(v.invoices) || v.invoices.length === 0).length,
  }

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <User />
          </div>
          <h1 className="text-2xl font-bold">Espace Client</h1>
        </div>

        {/* Recherche */}
        <div>
          <div className="flex items-center gap-2 sm:max-w-[90%] sm:mx-auto">
            <Input placeholder="Rechercher..." className="h-14 flex-1 " />
            <Button size="icon" variant="outline">
              <Search size={18} />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <VehicleStats
          total={stats.total}
          enCours={stats.enCours}
          termine={stats.termine}
          sansIntervention={stats.sansIntervention}
        />

        {/* Filtres */}
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="flex gap-2">
            <Button
              onClick={() => setFilterStatus("EN_COURS")}
              variant={filterStatus === "EN_COURS" ? "default" : "outline"}
            >
              En cours
            </Button>
            <Button
              onClick={() => setFilterStatus("TERMINEE")}
              variant={filterStatus === "TERMINEE" ? "default" : "outline"}
            >
              Terminées
            </Button>
            <Button
              onClick={() => setFilterStatus("ATTENTE_PIECES")}
              variant={filterStatus === "ATTENTE_PIECES" ? "default" : "outline"}
            >
              Attente pièces
            </Button>
          </div>

              <Select
                value={filterStatus}
                onValueChange={(value: string) => setFilterStatus(value as "ALL" | "EN_COURS" | "TERMINEE" | "ATTENTE_PIECES")}
              >
            <SelectTrigger className="sm:w-[220px] ">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="EN_COURS">En cours</SelectItem>
              <SelectItem value="ATTENTE_PIECES">Attente pièces</SelectItem>
              <SelectItem value="TERMINEE">Terminées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste véhicules/interventions */}
        {!openInterventionModal ? (
          <div className="space-y-4">
            {vehicles
              .flatMap(v => Array.isArray(v.invoices) ? v.invoices.map((i:Invoice) => ({ ...i, vehicle: v })) : [])
              .filter(inv => filterStatus === "ALL" ? true : toUIStatus(inv.status) === filterStatus)
              .map(intervention => (
                <div
                  key={intervention.id}
                  className="border rounded-xl p-5 flex flex-col gap-4 lg:flex-row lg:items-center hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Car className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-bold">{intervention.vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-500">{intervention.vehicle.brand}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 flex-1">
                    <Calendar className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium">{intervention.handledBy?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(intervention.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${statusStyles[toUIStatus(intervention.status)]}`}
                  >
                    {toUIStatus(intervention.status)}
                  </span>

                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleViewInterventions(intervention.vehicle)}
                  >
                    <Eye size={16} />
                    Détails
                  </Button>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-6 p-4 shadow-xl border rounded-lg">
            {/* Modal véhicule */}
            <div>
              <div className="flex justify-end">
                <Button onClick={() => setOpenInterventionModal(false)}>Fermer</Button>
              </div>
              <div className="mb-4 px-4">
                <p className="font-bold text-lg">{vehiculeSelect.licensePlate}</p>
                <p className="text-sm text-gray-500">
                  {vehiculeSelect.brand} {vehiculeSelect.model} ({vehiculeSelect.year})
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  <span>
                    <strong>Couleur :</strong> {vehiculeSelect.color}
                  </span>
                  <span>
                    <strong>Agence :</strong> {vehiculeSelect.base?.location}
                  </span>
                </div>
              </div>

              <div className="max-h-[400px] overflow-auto">
                {filterByUIStatus(interventionsVehicule, filterStatus).map(intervention => {
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
                            Confirmé le {new Date(intervention.dateOfConfirmation).toLocaleDateString()}
                          </div>
                        </div>

                        <span
                          className={`flex items-center gap-2 text-sm font-medium ${statusStyles[toUIStatus(intervention.status)]} px-3 py-1 rounded-full w-fit mb-2`}
                        >
                          {toUIStatus(intervention.status)}
                        </span>

                        <p className="text-xs text-gray-500 mb-3">
                          Mis à jour :{intervention.statusUpdatedAt
                            ? new Date(intervention.statusUpdatedAt).toLocaleString()
                            : new Date(intervention.createdAt).toLocaleDateString()}
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
                            onClick={() => handleViewDetails(intervention, intervention.vehicle)}
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
          </div>
        )}
      </div>

      <Modal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        modalDescription="Détail de l’intervention"
      >
        {interventionsVehicule[0] && (
        <InterventionDetailClient
  selectedVehicle={vehiculeSelect}
  onClose={() => setOpenDetailModal(false)}
/>

        )}
      </Modal>

    </div>
  )
}
