"use client"

import { useEffect, useMemo, useState } from "react"
import { Modal } from "@/src/shared/components/modal"
import { Button } from "@/src/shared/components/ui/button"
import { Vehicule } from "@/src/utils/types/vehicule"
import { useManageApi } from "./shared/useManage.api"
import { useClientApi } from "@/src/shared/hooks/useClient.api"
import { useAgenceApi } from "@/src/shared/hooks/useAgence.api"
import { AddVehiculeForm } from "./form/add-vehicule-form"
import { VehicleSearchBar } from "./shared/components/vehicle-search-bar"
import { VehicleListCard } from "./shared/components/vehicle-list-card"
import { VehicleFilters } from "./shared/components/vehicle-filters"
import { VehicleStats } from "./shared/components/vehicule-stats"
import { VehicleNotFound } from "./vehicle-not-found"
import { VehiclePreview } from "./shared/components/vehicle-apercu"
import { errorAlert, successAlert } from "@/src/lib/alerts"

export default function GestionnairePage() {
  const { getVehicles, searchVehicles, createVehicle } = useManageApi()
  const { getClients } = useClientApi()
  const { getAgences } = useAgenceApi()

  const [vehicles, setVehicles] = useState<Vehicule[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [agences, setAgences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [vehiculeNotFound, setVehiculeNotFound] = useState(false)
  const [openCreateVehiculeModal, setOpenCreateVehiculeModal] = useState(false)
  const [apercuVehiculeOpen, setApercuVehiculeOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicule | null>(null)
  const [filterByAllVehicule, setFilterByAllVehicule] = useState(true)

  const [search, setSearch] = useState("")
  const [preFillLicensePlate, setPreFillLicensePlate] = useState("")

  const [clientId, setClientId] = useState<string>()
  const [agenceId, setAgenceId] = useState<string>()
  const [statut, setStatut] = useState<string>()

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [v, c, a] = await Promise.all([
        getVehicles({ includeInvoices: true }),
        getClients(),
        getAgences(),
      ])
      setVehicles(v)
      setClients(c || [])
      setAgences(a || [])
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      loadAll()
      setVehiculeNotFound(false)
      return
    }

    try {
      const data = await searchVehicles(search)
      setVehicles(data)

      if (data.length === 0) {
        setVehiculeNotFound(true)
        setPreFillLicensePlate(search)
      } else {
        setVehiculeNotFound(false)
      }
    } catch (e: any) {
      errorAlert("Recherche", e.message)
    }
  }

  const handleCreateVehicle = async (data: Partial<Vehicule>) => {
    try {
      await createVehicle(data)
      successAlert("Véhicule créé")
      setOpenCreateVehiculeModal(false)
      setVehiculeNotFound(false)
      loadAll()
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

const filteredVehicles = useMemo(() => {
  return vehicles.filter(v => {
    if (clientId && v.client?.id !== clientId) return false

    if (agenceId && v.base?.id !== agenceId) return false

    if (statut && statut !== "all") {
      if (statut === "SANS_INTERVENTION") {
        if (v.invoices && v.invoices.length > 0) return false
      } else {
        // Cas normal : vérifier le dernier invoice
        const lastInvoice = v.invoices?.[v.invoices.length - 1]
        if (!lastInvoice) return false
        if (lastInvoice.status !== statut) return false
      }
    }

    return true
  })
}, [vehicles, clientId, agenceId, statut])



  const filteredAgences = useMemo(() => {
    if (clientId) {
      return agences.filter(a => a.clientId === clientId)
    }
    return agences
  }, [agences, clientId])

  return (
    <div className="h-full py-4 px-12 bg-zinc-50">
      <div className="bg-white min-h-full rounded-lg p-4">
        <h1 className="font-bold text-2xl">Page Gestionnaire</h1>

        {/* Barre de recherche */}
        <VehicleSearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
        />

        {!vehiculeNotFound ? (
          <>
            <div className="flex items-center gap-2 py-3">
              <Button
                variant={filterByAllVehicule ? "default" : "outline"}
                onClick={() => setFilterByAllVehicule(true)}
              >
                Tous les véhicules
              </Button>
              <Button
                variant={!filterByAllVehicule ? "default" : "outline"}
                onClick={() => setFilterByAllVehicule(false)}
              >
                Par agence
              </Button>
            </div>

            {/* FILTRES */}
            <VehicleFilters
              clients={clients}
              agences={filteredAgences}
              clientId={clientId}
              agenceId={agenceId}
              statut={statut}
              onChange={(filters) => {
                if ("clientId" in filters) {
                  setClientId(filters.clientId)
                  setAgenceId(undefined) // reset agence si client change
                }
                if ("agenceId" in filters) setAgenceId(filters.agenceId)
                if ("statut" in filters) setStatut(filters.statut)
              }}
            />

            {/* STATS */}
            <VehicleStats
              total={filteredVehicles.length}
              enCours={filteredVehicles.filter(v => !v.exitDate).length}
              termine={filteredVehicles.filter(v => v.exitDate).length}
              sansIntervention={filteredVehicles.filter(v => !v.invoices || v.invoices.length === 0).length}
            />

            {/* LISTE VEHICULES */}
            <VehicleListCard
              filterByAllVehicule={filterByAllVehicule}
              vehicles={filteredVehicles}
              clients={clients}
              agences={filteredAgences}
              onSelect={(v) => {
                setSelectedVehicle(v)
                setApercuVehiculeOpen(true)
              }}
            />
          </>
        ) : (
          <VehicleNotFound
            onBack={() => {
              setVehiculeNotFound(false)
              loadAll()
            }}
            onCreate={() => setOpenCreateVehiculeModal(true)}
          />
        )}
      </div>

      {/* MODAL CREATION VEHICULE */}
      <Modal
        open={openCreateVehiculeModal}
        onClose={() => setOpenCreateVehiculeModal(false)}
        modalTitle="Créer un nouveau véhicule"
      >
        <AddVehiculeForm
          mode="create"
          data={{ licensePlate: preFillLicensePlate } as Vehicule}
          onSubmit={handleCreateVehicle}
          onClose={() => setOpenCreateVehiculeModal(false)}
        />
      </Modal>

      {/* MODAL APERCU VEHICULE */}
      <Modal
        open={apercuVehiculeOpen}
        onClose={() => setApercuVehiculeOpen(false)}
        modalTitle="Aperçu véhicule"
      >
        {selectedVehicle && (
          <VehiclePreview
            licensePlate={selectedVehicle.licensePlate}
            brand={selectedVehicle.brand}
            model={selectedVehicle.model}
            year={selectedVehicle.year}
            client={selectedVehicle.client?.name}
            agence={selectedVehicle.base?.location}
            entreeDate={selectedVehicle.entryDate}
            enReparation={1}
            termine={0}
            onNewIntervention={() => {}}
          />
        )}
      </Modal>
    </div>
  )
}
