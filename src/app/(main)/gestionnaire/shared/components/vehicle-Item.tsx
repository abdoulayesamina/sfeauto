"use client"

import { useState } from "react"
import { DiamondPlus } from "lucide-react"

import { Vehicule } from "@/src/utils/types/vehicule"
import { Client } from "@/src/utils/types/client"
import { Agence } from "@/src/utils/types/agence"

import { Button } from "@/src/shared/components/ui/button"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Modal } from "@/src/shared/components/modal"

import { InterventionForm } from "../../form/intervention-form"
import { useInterventionApi } from "../useIntervention.api"

type VehicleItemProps = {
  vehicle?: Vehicule
  clients?: Client[]
  agences?: Agence[]
  onClick?: () => void
  compact?: boolean
  loading?: boolean
}


function VehicleItemSkeleton() {
  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}


export function VehicleItem({
  vehicle,
  clients = [],
  agences = [],
  onClick,
  compact = false,
  loading = false,
}: VehicleItemProps) {
  const [interventionModalOpen, setInterventionModalOpen] = useState(false)
  const { createIntervention, loading: submitting } = useInterventionApi()

  if (loading || !vehicle) {
    return <VehicleItemSkeleton />
  }

  const clientName =
    clients.find(c => c.id === vehicle.client?.id)?.name ?? "—"

  const agenceName =
    agences.find(a => a.id === vehicle.base?.id)?.location ?? "—"

const enReparationCount =
  vehicle.invoices?.filter(
    i => i.status === "FIXING_STARTED" || i.status === "WAITING_FOR_PARTS"
  ).length ?? 0

const termineCount =
  vehicle.invoices?.filter(
    i => i.status === "FIXING_FINISHED"
  ).length ?? 0


  const aucuneIntervention = (vehicle.invoices?.length ?? 0) === 0

  const handleSubmitIntervention = async (data: any) => {
    if (!vehicle.id) {
    console.error("Impossible de créer l'intervention : véhicule sans ID")
    return
  }
    await createIntervention({
      vehicleId: vehicle.id,
      accordNumber: data.numeroAccord,
      dateOfConfirmation: data.dateConfirmation,
      workDescription: data.descriptionTravaux,
      didOrderParts: data.piecesCommande === "oui",
      ordersDetails: data.detailsCommande || null,
      comments: data.commentaires || null,
    })

    setInterventionModalOpen(false)
  }

  return (
    <>
      <div
        className="
          mt-4
          bg-white
          border border-gray-200
          rounded-xl
          shadow-sm
          hover:shadow-lg
          transition-all duration-200
          flex flex-col lg:flex-row
          gap-4
        "
      >
        {/* Infos véhicule */}
        <div
          className="flex-1 px-6 py-5 cursor-pointer"
          onClick={onClick}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-lg font-semibold text-gray-900">
              {vehicle.licensePlate}
            </span>
            <span className="text-gray-500">
              {vehicle.brand} {vehicle.model} · {vehicle.year}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
            <span>{clientName}</span>
            {!compact && <span className="text-gray-400">• {agenceName}</span>}
            <span className="text-gray-400">
              <span className="text-gray-400">
                • Entrée : {vehicle.entryDate ? vehicle.entryDate.toString().slice(0, 10) : "—"}
              </span>
            </span>
          </div>
        </div>

        {/* Statuts & actions */}
        <div className="px-6 py-5 flex flex-col sm:flex-row items-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-100">
          {enReparationCount > 0 && (
            <span className="bg-yellow-50 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
              {enReparationCount} en réparation
            </span>
          )}

          {termineCount > 0 && (
            <span className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
              {termineCount} terminé
            </span>
          )}

          {aucuneIntervention && (
            <span className="bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
              Aucune intervention
            </span>
          )}

          <Button
            className="px-4 py-2 rounded-lg shadow-sm hover:shadow transition"
            onClick={() => setInterventionModalOpen(true)}
          >
            <DiamondPlus className="mr-2 h-4 w-4" />
            Intervention
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
        modalTitle="Créer une intervention"
      >
        <InterventionForm
          vehicleDisplayText={`${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}`}
          defaultAccordNumber="ACC-2026-001"
          onSubmit={handleSubmitIntervention}
          onClose={() => setInterventionModalOpen(false)}
          loading={submitting}
        />
      </Modal>
    </>
  )
}
