"use client"

import { useEffect, useMemo, useState } from "react"
import { DiamondPlus } from "lucide-react"

import { Vehicule } from "@/src/utils/types/vehicule"
import { Client } from "@/src/utils/types/client"
import { Agence } from "@/src/utils/types/agence"

import { Button } from "@/src/shared/components/ui/button"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Modal } from "@/src/shared/components/modal"

import { InterventionForm } from "../../form/intervention-form"
import { useInterventionApi } from "../useIntervention.api"
import { toUIStatus, getStatusMeta } from "@/src/utils/constants/intervention-status"
import { groupInterventionsByStatus } from "@/src/utils/constants/groupInterventionsByStatus"

type VehicleItemProps = {
  vehicle?: Vehicule
  clients?: Client[]
  agences?: Agence[]
  onClick?: () => void
  compact?: boolean
  loading?: boolean
  reloadVehicles?: () => void
}

/* ----------------------------- SKELETON ----------------------------- */
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
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- COMPONENT ----------------------------- */
export function VehicleItem({
  vehicle,
  clients = [],
  agences = [],
  onClick,
  compact = false,
  loading = false,
  reloadVehicles,
}: VehicleItemProps) {
  const [interventionModalOpen, setInterventionModalOpen] = useState(false)
  const { createIntervention, loading: submitting } = useInterventionApi()

  // State local pour les interventions (refresh instantané)
  // const [localInterventions, setLocalInterventions] = useState<any[]>(
  //   vehicle?.invoices ?? []
  // )

  // Quand le vehicle change, on resynchronise le state local
  // useEffect(() => {  
  //   setLocalInterventions(vehicle?.invoices ?? [])
  // }, [vehicle])

  

  if (loading || !vehicle) {
    return <VehicleItemSkeleton />
  }

  const clientName = useMemo(() => {
    return clients.find((c) => c.id === vehicle.client?.id)?.name ?? "—"
  }, [clients, vehicle.client?.id])

  const agenceName = useMemo(() => {
    return agences.find((a) => a.id === vehicle.base?.id)?.location ?? "—"
  }, [agences, vehicle.base?.id])

  const entryDateText = useMemo(() => {
    return vehicle.entryDate ? new Date(vehicle.entryDate).toLocaleDateString("fr-FR") : "—"
  }, [vehicle.entryDate])

  /* ----------------------------- ACTIONS ----------------------------- */
  const handleSubmitIntervention = async (data: any) => {
    if (!vehicle.id) return

    const status = data.piecesCommande === "oui" ? "WAITING_FOR_PARTS" : "FIXING_STARTED"

    const newIntervention = await createIntervention({
      vehicleId: vehicle.id,
      accordNumber: data.numeroAccord,
      dateOfConfirmation: data.dateConfirmation,
      workDescription: data.descriptionTravaux,
      didOrderParts: data.piecesCommande === "oui",
      ordersDetails: data.detailsCommande || null,
      comments: data.commentaires || null,
      status,
      images: data.images || [],
    }).catch((e) => {
      console.error("Error creating intervention:", e)
      return null
    })

    // setLocalInterventions((prev) => [newIntervention, ...prev])
    setInterventionModalOpen(false)
    reloadVehicles?.()
  }

  /* ----------------------------- BADGES GROUPES ----------------------------- */
  // const groupedBadges = useMemo(() => {
  //   if (!localInterventions || localInterventions.length === 0) return []
  //   return groupInterventionsByStatus(localInterventions as any[])
  // }, [localInterventions])

  const groupedBadges = useMemo(() => {
    if (!vehicle?.invoices?.length) return []
    return groupInterventionsByStatus(vehicle.invoices)
  }, [vehicle?.invoices])
  /* ----------------------------- UI ----------------------------- */
  return (
    <>
      <div
        className="
          mt-4 bg-white border border-gray-200 rounded-xl
          shadow-sm hover:shadow-md transition-all
          flex flex-col lg:flex-row gap-4
        "
      >
        {/* INFOS VEHICULE */}
        <div className="flex-1 px-6 py-5 cursor-pointer" onClick={onClick}>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-lg font-semibold text-gray-900">
              {vehicle.licensePlate}
            </span>
            <span className="text-gray-500">
              {vehicle.brand?.name} {vehicle.model?.name} · {vehicle.year}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
            <span>{clientName}</span>
              {!compact && <span className="text-gray-400">• {agenceName}</span>}
            <span className="text-gray-400">• Entrée : {entryDateText}</span>
          </div>
        </div>

        {/* STATUTS & ACTION */}
        <div className="
            px-2 py-5 flex flex-wrap flex-col items-start lg:items-end
            gap-2 border-t lg:border-t-0 lg:border-l border-gray-100
            2xl:max-w-[800px] xl:max-w-[500px] xl:min-w-[500px] lg:min-w-[230px]    
          "
        >
          <div className="flex lg:flex-col flex-wrap gap-1 xl:flex-row lg:justify-end bg-white">
            {groupedBadges.length > 0 ? (
              groupedBadges.map((g) => {
                const statusMeta = getStatusMeta(g.uiStatus)
                const label = g.count >= 2 ? `${g.count} ${statusMeta.label}` : statusMeta.label

                return (
                  <span
                    key={String(g.uiStatus)}
                    className={`
                      ${statusMeta.bg} ${statusMeta.color} text-xs font-medium
                      px-3 py-1 rounded-full flex items-center gap-1
                    `}
                  >
                    <statusMeta.icon className="w-3 h-3" />
                    {label}
                  </span>
                )
              })
            ) : (
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                Aucune intervention
              </span>
            )}
          </div>

          <Button
            className="px-4 py-2 rounded-lg shadow-sm hover:shadow transition ml-2"
            onClick={() => setInterventionModalOpen(true)}
          >
            <DiamondPlus className="mr-2 h-4 w-4" />
            Intervention
          </Button>
        </div>
      </div>

      {/* MODAL INTERVENTION */}
      <Modal
        open={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
        modalTitle="Créer une intervention"
      >
        <InterventionForm
          vehicleId={vehicle.id ?? ""}
          vehicleDisplayText={`${vehicle.licensePlate} - ${vehicle.brand?.name} ${vehicle.model?.name}`}
          defaultAccordNumber="ACC-2026-001"
          onSubmit={handleSubmitIntervention}
          onClose={() => setInterventionModalOpen(false)}
          loading={submitting}
        />
      </Modal>
    </>
  )
}
