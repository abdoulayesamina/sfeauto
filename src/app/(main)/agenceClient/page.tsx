"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2 } from "lucide-react"

import { Modal } from "@/src/shared/components/modal"
import { Button } from "@/src/shared/components/ui/button"
import { toUIStatus } from "@/src/utils/constants/intervention-status"

import { useAgenceClient } from "./shared/useAgenceClient"
import { useInterventionApi } from "../gestionnaire/shared/useIntervention.api"
import { InterventionForm } from "../gestionnaire/form/intervention-form"

import SearchFilters from "../client/components/SearchFilters"
import InterventionCard from "../client/components/InterventionCard"
import EmptyState from "../client/components/EmptyState"
import VehicleInterventionsModal from "../client/components/VehicleInterventionsModal"
import InterventionDetailClient from "../client/components/detailsInterv"

type UIStatus = "ALL" | "ATTENTE_REPARATION" | "TERMINEE" | "ATTENTE_PIECES"

type Counts = {
  ATTENTE_REPARATION: number
  ATTENTE_PIECES: number
  TERMINEE: number
}

export default function AgencePage() {
  const { listInterventions } = useAgenceClient()
  const { createIntervention, loading: creating } = useInterventionApi()

  const [interventions, setInterventions] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<UIStatus>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [openVehicleModal, setOpenVehicleModal] = useState(false)
  const [vehiculeSelect, setVehiculeSelect] = useState<any>(null)
  const [interventionsVehicule, setInterventionsVehicule] = useState<any[]>([])

  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [detailIntervention, setDetailIntervention] = useState<any>(null)

  const [openCreateIntervention, setOpenCreateIntervention] = useState(false)

  const reloadInterventions = async () => {
    const data = await listInterventions({ take: 500, skip: 0 })
    setInterventions(Array.isArray(data?.interventions) ? data.interventions : [])
  }

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setIsLoading(true)
        await reloadInterventions()
      } catch (err: any) {
        console.error("Erreur récupération interventions agence :", err?.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInterventions()
  }, [])

  const vehicleCards = useMemo(() => {
    const map = new Map<
      string,
      { vehicle: any; invoices: any[]; counts: Counts; lastInvoice: any | null }
    >()

    for (const inv of interventions) {
      const v = inv?.vehicle
      if (!v?.id) continue

      if (!map.has(v.id)) {
        map.set(v.id, {
          vehicle: v,
          invoices: [],
          counts: { ATTENTE_REPARATION: 0, ATTENTE_PIECES: 0, TERMINEE: 0 },
          lastInvoice: null,
        })
      }

      const row = map.get(v.id)!
      row.invoices.push(inv)

      if (!row.lastInvoice) {
        row.lastInvoice = inv
      } else {
        const a = new Date(row.lastInvoice.createdAt ?? 0).getTime()
        const b = new Date(inv.createdAt ?? 0).getTime()
        if (b > a) row.lastInvoice = inv
      }

      const ui = toUIStatus(inv.status)
      if (ui === "ATTENTE_REPARATION") row.counts.ATTENTE_REPARATION += 1
      if (ui === "ATTENTE_PIECES") row.counts.ATTENTE_PIECES += 1
      if (ui === "TERMINEE") row.counts.TERMINEE += 1
    }

    return Array.from(map.values()).map((x) => ({
      ...x,
      vehicle: { ...x.vehicle, invoices: x.invoices },
    }))
  }, [interventions])

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return vehicleCards.filter((row) => {
      const v = row.vehicle || {}

      const statusMatch =
        filterStatus === "ALL" ||
        (filterStatus === "ATTENTE_REPARATION" && row.counts.ATTENTE_REPARATION > 0) ||
        (filterStatus === "ATTENTE_PIECES" && row.counts.ATTENTE_PIECES > 0) ||
        (filterStatus === "TERMINEE" && row.counts.TERMINEE > 0)

      const plate = String(v.licensePlate || "").toLowerCase()
      const brand = String(v.brand ?? "").toLowerCase()
      const model = String(v.model || "").toLowerCase()

      const searchMatch = !q || plate.includes(q) || brand.includes(q) || model.includes(q)

      return statusMatch && searchMatch
    })
  }, [vehicleCards, filterStatus, searchQuery])

  const stats = useMemo(() => {
    const total = interventions.length
    const enCours = interventions.filter((i) => toUIStatus(i.status) === "ATTENTE_REPARATION").length
    const termine = interventions.filter((i) => toUIStatus(i.status) === "TERMINEE").length
    const attentePieces = interventions.filter((i) => toUIStatus(i.status) === "ATTENTE_PIECES").length
    return { total, enCours, termine, attentePieces }
  }, [interventions])

  const handleViewInterventions = (vehicleRow: any) => {
    const v = vehicleRow?.vehicle ?? vehicleRow
    setVehiculeSelect(v)

    const list = interventions
      .filter((inv) => inv?.vehicle?.id === v?.id)
      .map((inv) => ({ ...inv, vehicle: v }))

    setInterventionsVehicule(list)
    setOpenVehicleModal(true)
  }

  const handleViewDetails = (intervention: any, vehicle?: any) => {
    const v = vehicle ?? intervention?.vehicle ?? vehiculeSelect ?? null
    setVehiculeSelect(v)
    setDetailIntervention({ ...intervention, vehicle: v })
    setOpenDetailModal(true)
  }

  const handleCreateIntervention = async (data: any) => {
    if (!vehiculeSelect?.id) return

    await createIntervention({
      vehicleId: vehiculeSelect.id,
      accordNumber: data.numeroAccord,
      dateOfConfirmation: data.dateConfirmation,
      workDescription: data.descriptionTravaux,
      didOrderParts: data.piecesCommande === "oui",
      ordersDetails: data.detailsCommande || null,
      comments: data.commentaires || null,
      images: data.images || [],
    })

    await reloadInterventions()

    if (vehiculeSelect?.id) {
      const list = interventions
        .filter((inv) => inv?.vehicle?.id === vehiculeSelect?.id)
        .map((inv) => ({ ...inv, vehicle: vehiculeSelect }))
      setInterventionsVehicule(list)
    }

    setOpenCreateIntervention(false)
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

  const vehicleForDetails =
    vehiculeSelect && detailIntervention
      ? {
          ...vehiculeSelect,
          invoices: [
            {
              id: detailIntervention.id,
              status: detailIntervention.status,
              invoiceConfirmed: detailIntervention.invoiceConfirmed,
              workDescription: detailIntervention.workDescription,
              accordNumber: detailIntervention.accordNumber,
              dateOfConfirmation: detailIntervention.dateOfConfirmation,
              createdAt: detailIntervention.createdAt,
              statusUpdatedAt: detailIntervention.statusUpdatedAt,
            },
          ],
        }
      : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Agence</h1>
              <p className="text-gray-600">Véhicules & interventions de votre agence</p>
            </div>
          </div>
        </div>

        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white border p-4">
            <div className="text-sm text-gray-500">Total interventions</div>
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

        {!openVehicleModal ? (
          <div className="space-y-4">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((row) => {
                const representative = row.lastInvoice || row.invoices[0] || null
                if (!representative) return null

                const interventionForCard = {
                  ...representative,
                  vehicle: row.vehicle,
                  counts: row.counts,
                }

                return (
                  <InterventionCard
                    key={row.vehicle.id}
                    intervention={interventionForCard}
                    onViewInterventions={() => handleViewInterventions(row)}
                    onViewDetails={() => handleViewDetails(representative, row.vehicle)}
                    hideDetailsButton={true}

                  />
                )
              })
            ) : (
              <EmptyState searchQuery={searchQuery} />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setOpenCreateIntervention(true)}>+ Nouvelle intervention</Button>
            </div>

            <VehicleInterventionsModal
              vehicle={vehiculeSelect}  
              interventions={interventionsVehicule}
              filterStatus={filterStatus}
              onClose={() => setOpenVehicleModal(false)}
              onViewDetails={(inv) => handleViewDetails(inv, vehiculeSelect)}
            />
          </div>
        )}

        <Modal
          open={openDetailModal}
          onClose={() => {
            setOpenDetailModal(false)
            setDetailIntervention(null)
          }}
          modalDescription="Détail complet de l'intervention"
          className="max-w-4xl"
        >
          {vehicleForDetails && (
            <InterventionDetailClient
              selectedVehicle={vehicleForDetails}
              onClose={() => {
                setOpenDetailModal(false)
                setDetailIntervention(null)
              }}
            />
          )}
        </Modal>

        <Modal
          open={openCreateIntervention}
          onClose={() => setOpenCreateIntervention(false)}
          modalTitle="Créer une intervention"
        >
          {vehiculeSelect && (
            <InterventionForm
              vehicleId={vehiculeSelect.id}
              vehicleDisplayText={`${vehiculeSelect.licensePlate} - ${vehiculeSelect.brand ?? ""} ${
                vehiculeSelect.model ?? ""
              }`}
              defaultAccordNumber="ACC-2026-001"
              onSubmit={handleCreateIntervention}
              onClose={() => setOpenCreateIntervention(false)}
              loading={creating}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
