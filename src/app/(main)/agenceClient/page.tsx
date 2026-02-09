"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2 } from "lucide-react"

import { Modal } from "@/src/shared/components/modal"
import { toUIStatus } from "@/src/utils/constants/intervention-status"

import { useAgenceClient } from "./shared/useAgenceClient"

import SearchFilters from "../client/components/SearchFilters"
import InterventionCard from "../client/components/InterventionCard"
import EmptyState from "../client/components/EmptyState"
import VehicleInterventionsModal from "../client/components/VehicleInterventionsModal"
import InterventionDetailClient from "../client/components/detailsInterv"

type UIStatus = "ALL" | "ATTENTE_REPARATION" | "TERMINEE" | "ATTENTE_PIECES"

export default function AgencePage() {
  const { listInterventions } = useAgenceClient()

  const [interventions, setInterventions] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<UIStatus>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Modal interventions par véhicule
  const [openVehicleModal, setOpenVehicleModal] = useState(false)
  const [vehiculeSelect, setVehiculeSelect] = useState<any>(null)
  const [interventionsVehicule, setInterventionsVehicule] = useState<any[]>([])

  // Modal détail intervention
  const [openDetailModal, setOpenDetailModal] = useState(false)

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setIsLoading(true)
        const data = await listInterventions({ take: 200, skip: 0 })
        setInterventions(Array.isArray(data?.interventions) ? data.interventions : [])
      } catch (err: any) {
        console.error("Erreur récupération interventions agence :", err?.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterventions()
  }, [])

  const filteredInterventions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return interventions
      .map((inv) => ({ ...inv, vehicle: inv.vehicle || {} }))
      .filter((inv) => {
        const ui = toUIStatus(inv.status)
        const statusMatch = filterStatus === "ALL" || ui === filterStatus

        const plate = (inv?.vehicle?.licensePlate || "").toLowerCase()
        const brand = (inv?.vehicle?.brand || "").toLowerCase()
        const model = (inv?.vehicle?.model || "").toLowerCase()
        const accord = (inv?.accordNumber || "").toLowerCase()

        const searchMatch =
          !q ||
          plate.includes(q) ||
          brand.includes(q) ||
          model.includes(q) ||
          accord.includes(q)

        return statusMatch && searchMatch
      })
  }, [interventions, filterStatus, searchQuery])

  const stats = useMemo(() => {
    const total = interventions.length
    const enCours = interventions.filter((i) => toUIStatus(i.status) === "ATTENTE_REPARATION").length
    const termine = interventions.filter((i) => toUIStatus(i.status) === "TERMINEE").length
    const attentePieces = interventions.filter((i) => toUIStatus(i.status) === "ATTENTE_PIECES").length
    return { total, enCours, termine, attentePieces }
  }, [interventions])

  const handleViewInterventions = (vehicle: any) => {
    setVehiculeSelect(vehicle)

    const list = interventions
      .filter((inv) => inv?.vehicle?.id === vehicle?.id)
      .map((inv) => ({ ...inv, vehicle }))

    setInterventionsVehicule(list)
    setOpenVehicleModal(true)
  }

  // ✅ IMPORTANT: pour que InterventionDetailClient marche,
  // on doit remplir interventionsVehicule + vehiculeSelect (comme ClientPage)
  const handleViewDetails = (intervention: any, vehicle?: any) => {
    const v = vehicle ?? intervention?.vehicle ?? null

    setVehiculeSelect(v)
    setInterventionsVehicule([{ ...intervention, vehicle: v }]) // 🔥 crucial
    setOpenDetailModal(true)
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

  // ✅ construire un "Vehicle" compatible avec InterventionDetailClient
  const vehicleForDetails =
    vehiculeSelect && interventionsVehicule.length
      ? {
          ...vehiculeSelect,
          // le composant lit selectedVehicle.invoices[0]
          invoices: interventionsVehicule.map((inv) => ({
            id: inv.id,
            status: inv.status,
            invoiceConfirmed: inv.invoiceConfirmed,
            workDescription: inv.workDescription,
            accordNumber: inv.accordNumber,
            dateOfConfirmation: inv.dateOfConfirmation,
            createdAt: inv.createdAt,
          })),
        }
      : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Agence</h1>
              <p className="text-gray-600">Interventions rattachées à votre agence (base)</p>
            </div>
          </div>
        </div>

        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white border p-4">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="rounded-xl bg-white border p-4">
            <div className="text-sm text-gray-500">En cours</div>
            <div className="text-2xl font-bold">{stats.enCours}</div>
          </div>
          <div className="rounded-xl bg-white border p-4">
            <div className="text-sm text-gray-500">Attente pièces</div>
            <div className="text-2xl font-bold">{stats.attentePieces}</div>
          </div>
          <div className="rounded-xl bg-white border p-4">
            <div className="text-sm text-gray-500">Terminées</div>
            <div className="text-2xl font-bold">{stats.termine}</div>
          </div>
        </div>

        {/* Liste / Modal véhicule */}
        {!openVehicleModal ? (
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
            onClose={() => setOpenVehicleModal(false)}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Modal détail (compatible InterventionDetailClient) */}
        <Modal
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          modalDescription="Détail complet de l'intervention"
          className="max-w-4xl"
        >
          {vehicleForDetails && (
            <InterventionDetailClient
              selectedVehicle={vehicleForDetails}
              onClose={() => setOpenDetailModal(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
