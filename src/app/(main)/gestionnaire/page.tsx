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
import { useInterventionApi } from "./shared/useIntervention.api"
import { InterventionForm } from "./form/intervention-form"
import { toast } from "sonner"
import { getBrandNameById, getModelNameById } from "../brands/shared/hooks/GetBrandOrModelName"
import { formatLicensePlate } from "@/src/utils/formatters"
import { searchSmart } from "@/src/utils/searchSmart"

export default function GestionnairePage() {
  const { getVehicles, searchVehicles, createVehicle } = useManageApi()
  const { getClients } = useClientApi()
  const { getAgences } = useAgenceApi()
  const { createIntervention } = useInterventionApi()

  const [vehicles, setVehicles] = useState<Vehicule[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [agences, setAgences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [vehiculeNotFound, setVehiculeNotFound] = useState(false)
  const [openCreateVehiculeModal, setOpenCreateVehiculeModal] = useState(false)
  const [apercuVehiculeOpen, setApercuVehiculeOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null)

  const [filterByAllVehicule, setFilterByAllVehicule] = useState(true)
  const [search, setSearch] = useState("")
  const [preFillLicensePlate, setPreFillLicensePlate] = useState("")
  const [clientId, setClientId] = useState<string>()
  const [agenceId, setAgenceId] = useState<string>()
  const [statut, setStatut] = useState<string>()

  const [interventionModalOpen, setInterventionModalOpen] = useState(false)

  const normalizeVehicles = (v: any): Vehicule[] => {
    if (Array.isArray(v)) return v
    if (Array.isArray(v?.vehicles)) return v.vehicles
    return []
  }

  const normalizeArray = <T,>(x: any): T[] => {
    return Array.isArray(x) ? x : []
  }

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

      setVehicles(normalizeVehicles(v))
      setClients(normalizeArray(c))
      setAgences(normalizeArray(a))
    } catch (e: any) {
      toast.error("Erreur", e.message)
    } finally {
      setLoading(false)
    }
  }

  // Recherche
  // const handleSearch = async () => {

  //   if (!search.trim()) {
  //     await loadAll()
  //     setVehiculeNotFound(false)
  //     return
  //   }

  //   try {
  //     const data = await searchVehicles(search)
  //     const vv = normalizeVehicles(data)

  //     setVehicles(vv)
  //     setVehiculeNotFound(vv.length === 0)
  //     if (vv.length === 0) setPreFillLicensePlate(search)
  //   } catch (e: any) {
  //     toast.error("Recherche", e.message)
  //   }
  // }

  const handleSearch = async () => {
    if (!search.trim()) {
      await loadAll()
      setVehiculeNotFound(false)
      return
    }

    try {
      const { normalized } = searchSmart(search)

      const data = await searchVehicles(normalized)

      const vv = normalizeVehicles(data)

      setVehicles(vv)
      setVehiculeNotFound(vv.length === 0)

      if (vv.length === 0) setPreFillLicensePlate(search)

    } catch (e: any) {
      toast.error("Recherche", e.message)
    }
  }

  const handleCreateVehicle = async (data: Partial<Vehicule>) => {
    debugger
    try {
      setLoading(true)
      await createVehicle(data)
      toast.success("Véhicule créé")
      setLoading(false)
      setOpenCreateVehiculeModal(false)
      setVehiculeNotFound(false)
      await loadAll()
    } catch (e: any) {
      toast.error("Erreur: " + e.message)

      setLoading(false)
    }
  }

  const [filteredVehicles, setFilteredVehicles] = useState<Vehicule[]>([])

  useEffect(() => {
    const list = Array.isArray(vehicles) ? vehicles : []

    const filtered = list.filter((v) => {
      if (clientId && v.client?.id !== clientId) return false
      if (agenceId && v.base?.id !== agenceId) return false

      if (statut && statut !== "all") {
        if (statut === "SANS_INTERVENTION") {
          if (v.invoices && v.invoices.length > 0) return false
        } else {
          const lastInvoice = v.invoices?.[v.invoices.length - 1]
          if (!lastInvoice) return false
          if (lastInvoice.status !== statut) return false
        }
      }

      return true
    })
    setFilteredVehicles(filtered)
  }, [vehicles, clientId, agenceId, statut])

  useEffect(() => {
    if (!selectedVehicle) return

    const updatedVehicle = vehicles.find(v => v.id === selectedVehicle.id)
    if (updatedVehicle) {
      setSelectedVehicle(updatedVehicle)
    }
  }, [vehicles])

  const filteredAgences = useMemo(() => {
    const list = Array.isArray(agences) ? agences : []
    if (clientId) return list.filter((a) => a.clientId === clientId)
    return list
  }, [agences, clientId])

  const handleSubmitIntervention = async (data: any) => {
    setLoading(true)
    try {
      await createIntervention({
        vehicleId: selectedVehicle?.id ?? "",
        accordNumber: data.numeroAccord,
        dateOfConfirmation: data.dateConfirmation,
        workDescription: data.descriptionTravaux,
        didOrderParts: data.piecesCommande === "oui",
        ordersDetails: data.detailsCommande || null,
        comments: data.commentaires || null,
        images: data.images || [],
      })

      await loadAll()
      // if(selectedVehicle) {
      //   const updatedVehicle = vehicles.find(v => v.id === selectedVehicle.id)
      //   setSelectedVehicle(updatedVehicle ?? null)
      // }
      setLoading(false)
      setInterventionModalOpen(false)
      toast.success("Intervention créée")
    } catch (e: any) {
      toast.error("Intervention", e.message)
      setLoading(false)
    }
  }

  const handleNewInterventionFromVehiculePreview = () => {
    setInterventionModalOpen(true)
  }

  // const session = getSession();
  return (
    <div className="h-full py-4 px-12 bg-zinc-50">
      <div className="bg-white min-h-full rounded-lg p-4">
        <h1 className="font-bold text-2xl">Page Gestionnaire</h1>

        {/* Barre de recherche */}
        <VehicleSearchBar value={search} onChange={setSearch} onSearch={handleSearch} />

        {!vehiculeNotFound ? (
          <>
            {/* Toggle tous / par agence */}
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
                  setAgenceId(undefined)
                }
                if ("agenceId" in filters) setAgenceId(filters.agenceId)
                if ("statut" in filters) setStatut(filters.statut)
              }}
            />

            {/* STATS */}
            <VehicleStats
              total={filteredVehicles.length}
              // enCours={
              //   filteredVehicles.filter((v) => v.invoices?.some((i) => i.status !== "FIXING_FINISHED")).length
              // }
              enCours={
                filteredVehicles.filter((v) => {
                  const invoices = v.invoices || []
                  return invoices.length > 0 && invoices.some(i => i.status !== "FIXING_FINISHED")
                }).length
              }
              // termine={filteredVehicles.filter((v) => v.invoices?.some((i) => i.status === "FIXING_FINISHED")).length}
              termine={
                filteredVehicles.filter((v) => {
                  const invoices = v.invoices || []
                  return invoices.length > 0 && invoices.every(i => i.status === "FIXING_FINISHED")
                }).length
              }
              sansIntervention={filteredVehicles.filter((v) => !v.invoices || v.invoices.length === 0).length}
            // Somme de tout les Invoice de tous les véhicules dont le base.location est "Paris Test Agency"
            // test={filteredVehicles.filter((v) => v.base?.location === "Paris Test Agency").reduce((sum, v) => {
            //   const invoices = Array.isArray(v.invoices) ? v.invoices : []
            //   return sum + invoices.reduce((invSum, i) => invSum , 0)
            // }, 0) }
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
              reloadVehicles={loadAll}
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
          loading={loading}
        />
      </Modal>

      {/* MODAL APERCU VEHICULE */}
      <Modal open={apercuVehiculeOpen} onClose={() => setApercuVehiculeOpen(false)} modalTitle="Aperçu véhicule">
        {selectedVehicle && (
          <VehiclePreview
            // licensePlate={selectedVehicle.licensePlate}
            licensePlate={formatLicensePlate(selectedVehicle.licensePlate || "")}
            brand={selectedVehicle.brand?.name ?? ""}
            model={selectedVehicle.model?.name ?? ""}
            year={selectedVehicle.year ?? 0}
            client={selectedVehicle.client?.name ?? ""}
            agence={selectedVehicle.base?.location ?? ""}
            entreeDate={selectedVehicle.entryDate ?? ""}
            color={selectedVehicle.color ?? ""}
            invoices={selectedVehicle.invoices ?? []}
            enReparation={1}
            termine={0}
            onNewIntervention={handleNewInterventionFromVehiculePreview}
            reloadInvoiceList={loadAll}
          />
        )}
      </Modal>

      {/* MODAL CREATION INTERVENTION */}
      <Modal
        open={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
        modalTitle="Créer une intervention"
      >
        <InterventionForm
          vehicleId={selectedVehicle?.id ?? ""}
          // vehicleDisplayText={`${selectedVehicle?.licensePlate} - ${selectedVehicle?.brand?.name ?? ""} ${selectedVehicle?.model?.name ?? ""}`}
          vehicleDisplayText={`${formatLicensePlate(selectedVehicle?.licensePlate || "")} - ${selectedVehicle?.brand?.name ?? ""} ${selectedVehicle?.model?.name ?? ""}`}
          defaultAccordNumber="ACC-2026-001"
          onSubmit={handleSubmitIntervention}
          onClose={() => setInterventionModalOpen(false)}
          loading={loading}
        />
      </Modal>
    </div>
  )
}
