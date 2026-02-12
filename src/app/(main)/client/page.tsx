"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { VehicleStats } from "../gestionnaire/shared/components/vehicule-stats"
import { Modal } from "@/src/shared/components/modal"
import InterventionDetailClient from "./components/detailsInterv"
import { useVehiculesApi } from "./shared/useVehicules.api"
import { Invoice } from "@/src/utils/types/invoice"
import SearchFilters from "./components/SearchFilters"
import InterventionCard from "./components/InterventionCard"
import VehicleInterventionsModal from "./components/VehicleInterventionsModal"
import EmptyState from "./components/EmptyState"

export default function ClientPage() {
  const { getVehicules } = useVehiculesApi()

  const [vehicles, setVehicles] = useState<any[]>([])
  const [interventionsVehicule, setInterventionVehicule] = useState<any[]>([])
  const [vehiculeSelect, setVehiculeSelect] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ATTENTE_REPARATION" | "TERMINEE" | "ATTENTE_PIECES">("ALL")
  const [openInterventionModal, setOpenInterventionModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        setIsLoading(true)
        const data = await getVehicules()
        setVehicles(data.vehicles)
        
      } catch (err: any) {
        console.error("Erreur récupération véhicules :", err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVehicules()
  }, [])

  const handleViewInterventions = (v: any) => {
    setVehiculeSelect(v)
    setInterventionVehicule(Array.isArray(v.invoices) ? v.invoices : [])
    setOpenInterventionModal(true)
  }

  const handleViewDetails = (intervention: any, vehicle?: any) => {
    setInterventionVehicule([{ ...intervention, vehicle }])
    setOpenDetailModal(true)
  }

  const filteredInterventions = vehicles
    .flatMap(v => 
      Array.isArray(v.invoices) 
        ? v.invoices.map((i: Invoice) => ({ ...i, vehicle: v }))
        : []
    )
    .filter(inv => {
      const { toUIStatus } = require("@/src/utils/constants/intervention-status")
      const statusMatch = filterStatus === "ALL" || toUIStatus(inv.status) === filterStatus
      
      const searchMatch = searchQuery === "" || 
        inv.vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(inv.vehicle.brand).toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.accordNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return statusMatch && searchMatch
    })

  const stats = {
    total: vehicles.length,
    enCours: vehicles.filter(v => 
      Array.isArray(v.invoices) && 
      v.invoices.some((i: Invoice) => {
        const { toUIStatus } = require("@/src/utils/constants/intervention-status")
        return toUIStatus(i.status) === "ATTENTE_REPARATION"
      })
    ).length,
    termine: vehicles.filter(v => 
      Array.isArray(v.invoices) && 
      v.invoices.every((i: Invoice) => {
        const { toUIStatus } = require("@/src/utils/constants/intervention-status")
        return toUIStatus(i.status) === "TERMINEE"
      }) && 
      v.invoices.length > 0
    ).length,
    sansIntervention: vehicles.filter(v => 
      !Array.isArray(v.invoices) || v.invoices.length === 0
    ).length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des interventions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Client</h1>
              <p className="text-gray-600">Suivez vos interventions en temps réel</p>
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* Stats */}
        <div className="mb-8">
          <VehicleStats
            total={stats.total}
            enCours={stats.enCours}
            termine={stats.termine}
            sansIntervention={stats.sansIntervention}
          />
        </div>

        {/* Liste des interventions */}
        {!openInterventionModal ? (
          <div className="space-y-4">
            {filteredInterventions.length > 0 ? (
              filteredInterventions.map((intervention) => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                  onViewInterventions={() => handleViewInterventions(intervention.vehicle)}
                  onViewDetails={() => handleViewDetails(intervention, intervention.vehicle)}
                />
              ))
            ) : (
              <EmptyState searchQuery={searchQuery} />
            )}
          </div>
        ) : (
          <VehicleInterventionsModal
            vehicle={vehiculeSelect}
            interventions={interventionsVehicule}
            filterStatus={filterStatus}
            onClose={() => setOpenInterventionModal(false)}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Modal détail intervention */}
        <Modal
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          modalDescription="Détail complet de l'intervention"
          className="max-w-4xl"
        >
          {interventionsVehicule[0] && (
            <InterventionDetailClient
              selectedVehicle={vehiculeSelect}
              onClose={() => setOpenDetailModal(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}