"use client"

import { useEffect, useMemo, useState } from "react"
import { DiamondPlus, CarFront, CircleSlash2 } from "lucide-react"
import { useSession } from "next-auth/react"

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
import { formatLicensePlate } from "@/src/utils/formatters"
import { toast } from "sonner"

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

  const { data: session } = useSession()
  const role = session?.user?.role ?? null
  const canToggleAbsence = ["MANAGER", "MECHANIC", "ADMIN"].includes(role ?? "")

  const [isAbsent, setIsAbsent] = useState<boolean>(Boolean(vehicle?.veh_absent))
  const [absentLoading, setAbsentLoading] = useState(false)

  useEffect(() => {
    setIsAbsent(Boolean(vehicle?.veh_absent))
  }, [vehicle?.veh_absent])

  // State local pour les interventions (refresh instantané)
  // const [localInterventions, setLocalInterventions] = useState<any[]>(
  //   vehicle?.interventions ?? []
  // )

  // Quand le vehicle change, on resynchronise le state local
  // useEffect(() => {  
  //   setLocalInterventions(vehicle?.interventions ?? [])
  // }, [vehicle])



  if (loading || !vehicle) {
    return <VehicleItemSkeleton />
  }

  const clientName = useMemo(() => {
    return clients.find((c) => c.cli_id === vehicle.veh_client?.cli_id)?.cli_name ?? "—"
  }, [clients, vehicle.veh_client?.cli_id])

  const agenceName = useMemo(() => {
    return agences.find((a) => a.bas_id === vehicle.veh_base?.bas_id)?.bas_location ?? "—"
  }, [agences, vehicle.veh_base?.bas_id])

  const entryDateText = useMemo(() => {
    return vehicle.veh_entryDate ? new Date(vehicle.veh_entryDate).toLocaleDateString("fr-FR") : "—"
  }, [vehicle.veh_entryDate])

  /* ----------------------------- ACTIONS ----------------------------- */
  const handleSubmitIntervention = async (data: any) => {
    if (!vehicle.veh_id) return

    const status = data.piecesCommande === "oui" ? "WAITING_FOR_PARTS" : "FIXING_STARTED"
    try{
      const newIntervention = await createIntervention({
        veh_vehicleId: vehicle.veh_id,
        veh_accordNumber: data.numeroAccord,
        veh_dateOfConfirmation: data.dateConfirmation,
        veh_workDescription: data.descriptionTravaux,
        veh_didOrderParts: data.piecesCommande === "oui",
        veh_ordersDetails: data.detailsCommande || null,
        veh_comments: data.commentaires || null,
        veh_status : status,
        veh_images: data.images || [],
        veh_kilometrage: data.kilometrage || "",
      })
      setInterventionModalOpen(false)
      reloadVehicles?.()
    }catch(e:any) {
      console.error("Error creating intervention:", e)
      return toast.error("Erreur : "+e.message)
    }     
    

    // setLocalInterventions((prev) => [newIntervention, ...prev])
    
  }

  const handleToggleAbsent = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!vehicle.veh_id || absentLoading) return

    const next = !isAbsent
    setAbsentLoading(true)
    // Optimistic update
    setIsAbsent(next)

    try {
      const res = await fetch(`/api/vehicles/${vehicle.veh_id}/absence`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absent: next }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setIsAbsent(!next) // rollback
        toast.error(errData.error || "Échec de la mise à jour de l'absence")
        return
      }

      toast.success(next ? "Véhicule marqué absent" : "Véhicule marqué présent")
      reloadVehicles?.()
    } catch (err) {
      setIsAbsent(!next) // rollback
      console.error("Error toggling absence:", err)
      toast.error("Erreur réseau lors de la mise à jour de l'absence")
    } finally {
      setAbsentLoading(false)
    }
  }

  /* ----------------------------- BADGES GROUPES ----------------------------- */
  // const groupedBadges = useMemo(() => {
  //   if (!localInterventions || localInterventions.length === 0) return []
  //   return groupInterventionsByStatus(localInterventions as any[])
  // }, [localInterventions])

  const groupedBadges = useMemo(() => {
    if (!vehicle?.interventions?.length) return []
    return groupInterventionsByStatus(vehicle.interventions)
  }, [vehicle?.interventions])
  /* ----------------------------- UI ----------------------------- */
  return (
    <>
      <div
        onClick={onClick}
        className="
  mt-4 rounded-xl border border-gray-200 bg-white
  hover:border-[#F5963A]
  transition-all duration-200
  flex flex-col lg:flex-row gap-4
  cursor-pointer
"
      >
        {/* INFOS VEHICULE */}
        <div className="flex-1 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-lg font-semibold text-gray-900">
              {/* {vehicle.licensePlate} */}
              {formatLicensePlate(vehicle.veh_licensePlate || "")}
            </span>
            <span className="text-gray-500">
              {vehicle.veh_brand?.bra_name} {vehicle.veh_model?.mod_name} · {vehicle.veh_year}
            </span>

            {canToggleAbsence && (
              <button
                type="button"
                onClick={handleToggleAbsent}
                disabled={absentLoading}
                title={
                  isAbsent
                    ? "Véhicule absent — cliquer pour marquer présent"
                    : "Véhicule présent — cliquer pour marquer absent"
                }
                aria-pressed={isAbsent}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition
                  ${absentLoading ? "opacity-60 cursor-wait" : "cursor-pointer"}
                  ${isAbsent
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
              >
                {isAbsent ? (
                  <CircleSlash2 className="h-3.5 w-3.5" />
                ) : (
                  <CarFront className="h-3.5 w-3.5" />
                )}
                {isAbsent ? "Absent" : "Présent"}
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
            <span>{clientName}</span>
            {!compact && <span className="text-gray-400">• {agenceName}</span>}
            <span className="text-gray-400">• Entrée : {entryDateText}</span>
          </div>
        </div>

        {/* STATUTS & ACTION */}
        <div
          className="
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
            disabled={isAbsent}
            title={isAbsent ? "Véhicule absent : aucune intervention possible" : undefined}
            onClick={(e) => {
              e.stopPropagation()
              if (isAbsent) return
              setInterventionModalOpen(true)
            }}
          >
            <DiamondPlus className="mr-2 h-4 w-4" />
            Intervention
          </Button>
        </div>
      </div>

      <Modal
        open={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
        modalTitle="Créer une intervention"
      >
        <InterventionForm
          kilometrage={vehicle.veh_kilometrage ?? ""}
          vehicleId={vehicle.veh_id ?? ""}
          vehicleDisplayText={`${vehicle.veh_licensePlate} - ${vehicle.veh_brand?.bra_name} ${vehicle.veh_model?.mod_name}`}
          defaultAccordNumber="ACC-2026-001"
          onSubmit={handleSubmitIntervention}
          onClose={() => setInterventionModalOpen(false)}
          loading={submitting}
        />
      </Modal>
    </>
  )
}
