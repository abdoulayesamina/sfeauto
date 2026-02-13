"use client"

import { useEffect, useMemo, useState } from "react"
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
import { toUIStatus } from "@/src/utils/constants/intervention-status"

type UIStatus = "ALL" | "ATTENTE_REPARATION" | "TERMINEE" | "ATTENTE_PIECES"

export default function ClientPage() {
  const { getVehicules } = useVehiculesApi()

  const [vehicles, setVehicles] = useState<any[]>([])
  const [interventionsVehicule, setInterventionVehicule] = useState<any[]>([])
  const [vehiculeSelect, setVehiculeSelect] = useState<any>(null)

  const [filterStatus, setFilterStatus] = useState<UIStatus>("ALL")
  const [openInterventionModal, setOpenInterventionModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        setIsLoading(true)
        const data = await getVehicules()
        setVehicles(Array.isArray(data?.vehicles) ? data.vehicles : [])
      } catch (err: any) {
        console.error("Erreur récupération véhicules :", err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVehicules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleViewInterventions = (v: any) => {
    setVehiculeSelect(v)
    setInterventionVehicule(Array.isArray(v.invoices) ? v.invoices : [])
    setOpenInterventionModal(true)
  }

  const handleViewDetailsFromVehicle = (v: any) => {
    const invoices: Invoice[] = Array.isArray(v.invoices) ? v.invoices : []
    if (!invoices.length) return

    const last = invoices[invoices.length - 1]
    setVehiculeSelect(v)
    setInterventionVehicule([{ ...last, vehicle: v }]) 
    setOpenDetailModal(true)
  }

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return (Array.isArray(vehicles) ? vehicles : [])
      .map((v) => ({
        ...v,
        invoices: Array.isArray(v.invoices) ? v.invoices : [],
      }))
      .filter((v) => {
        // filtre texte
        const plate = String(v.licensePlate ?? "").toLowerCase()
        const brand = String(v.brand ?? "").toLowerCase()
        const model = String(v.model ?? "").toLowerCase()

        const searchMatch =
          !q || plate.includes(q) || brand.includes(q) || model.includes(q)

        // filtre statut (match si au moins 1 invoice correspond)
        let statusMatch = true
        if (filterStatus !== "ALL") {
          statusMatch = v.invoices.some((i: Invoice) => toUIStatus(i.status) === filterStatus)
        }

        return searchMatch && statusMatch
      })
  }, [vehicles, searchQuery, filterStatus])

  const stats = useMemo(() => {
    const total = vehicles.length

    const enCours = vehicles.filter(
      (v) =>
        Array.isArray(v.invoices) &&
        v.invoices.some((i: Invoice) => toUIStatus(i.status) === "ATTENTE_REPARATION")
    ).length

    const termine = vehicles.filter(
      (v) =>
        Array.isArray(v.invoices) &&
        v.invoices.length > 0 &&
        v.invoices.every((i: Invoice) => toUIStatus(i.status) === "TERMINEE")
    ).length

    const sansIntervention = vehicles.filter(
      (v) => !Array.isArray(v.invoices) || v.invoices.length === 0
    ).length

    return { total, enCours, termine, sansIntervention }
  }, [vehicles])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
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

        {/* Liste : 1 card par véhicule */}
        {!openInterventionModal ? (
          <div className="space-y-4">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v) => (
                <InterventionCard
                  key={v.id}
                 
                  intervention={{ vehicle: v }}
                  onViewInterventions={() => handleViewInterventions(v)}
                  onViewDetails={() => handleViewDetailsFromVehicle(v)}
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
            // si ton modal appelle onViewDetails(intervention, vehicle)
            onViewDetails={(intervention: any, vehicle?: any) => {
              const v = vehicle ?? vehiculeSelect
              setVehiculeSelect(v)
              setInterventionVehicule([{ ...intervention, vehicle: v }])
              setOpenDetailModal(true)
            }}
          />
        )}

        {/* Modal détail intervention */}
        <Modal
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          modalDescription="Détail complet de l'intervention"
          className="max-w-4xl"
        >
          {vehiculeSelect && (
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
