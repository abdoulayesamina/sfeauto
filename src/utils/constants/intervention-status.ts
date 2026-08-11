import { InterventionStatus } from "@/generated/prisma"
import { Wrench, Car, Clock, XCircle, Ban } from "lucide-react"

export type UIStatus = InterventionStatus

export const STATUS_UI_MAP: Record<InterventionStatus, string> = {
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
  WAITING_FOR_APPROVAL: "EN_ATTENTE_ACCORD",
  REFUSED: "REFUSE",
  CANCELLED: "ANNULEE",
  DELETED: "SUPPRIMEE",
}

export const UI_TO_INTERVENTIONSTATUS: Record<string, InterventionStatus> = {
  EN_COURS: "FIXING_STARTED",
  ATTENTE_PIECES: "WAITING_FOR_PARTS",
  TERMINEE: "FIXING_FINISHED",
  EN_ATTENTE_ACCORD: "WAITING_FOR_APPROVAL",
  REFUSE: "REFUSED",
  ANNULEE: "CANCELLED",
  SUPPRIMEE: "DELETED",
}

/**
 * Un véhicule est inclus dans une liste filtrée par statut côté serveur dès
 * qu'il a une intervention dont le statut BRUT correspond (`int_status`).
 * Mais côté client, `adaptLegacyIntervention` peut reclassifier le statut
 * affiché d'une intervention (ex: FIXING_STARTED sans n° d'accord devient
 * "en attente d'accord"). Un véhicule peut donc être sélectionné par le
 * serveur sans qu'aucune de ses interventions n'affiche réellement le statut
 * filtré une fois adapté. Cette fonction revérifie côté client, sur les
 * statuts déjà adaptés, si le véhicule doit vraiment apparaître dans la liste
 * filtrée — sans quoi on l'exclut, plutôt que de montrer des badges qui ne
 * correspondent pas au filtre demandé.
 */
export const vehicleMatchesStatutFilter = (
  vehicle: { interventions?: { int_status?: UIStatus | null }[] },
  activeStatut?: string,
): boolean => {
  if (!activeStatut || activeStatut === "all") return true

  const interventions = vehicle.interventions ?? []

  if (activeStatut === "SANS_INTERVENTION") return interventions.length === 0

  const targetStatus = UI_TO_INTERVENTIONSTATUS[activeStatut] ?? activeStatut
  return interventions.some((i) => i.int_status === targetStatus)
}

export const adaptLegacyIntervention = (intervention: any): any => {
  if (!intervention) return intervention
  
  const adapted = { ...intervention }
  
  if (intervention.int_supprimee === true) {
    adapted.int_status = "DELETED"
  } else if (intervention.int_annulee === true) {
    adapted.int_status = "CANCELLED"
  } else if (intervention.int_accordNumber === "REFUSE") {
    adapted.int_status = "REFUSED"
  } else if (!intervention.int_accordNumber && intervention.int_status === "FIXING_STARTED") {
    // If there's no accord number and status is FIXING_STARTED, it means we're waiting for approval
    adapted.int_status = "WAITING_FOR_APPROVAL"
  }
  
  return adapted
}

export const computeUIStatus = (intervention: {
  int_status?: InterventionStatus;
}): UIStatus => {
  return intervention.int_status ?? "FIXING_STARTED"
}

export const getStatusMeta = (status: UIStatus) => {
  const map: Record<UIStatus, { label: string; color: string; bg: string; icon: any }> = {
    FIXING_STARTED: {
      label: "En cours",
      color: "text-blue-700",
      bg: "bg-blue-100",
      icon: Wrench,
    },
    WAITING_FOR_PARTS: {
      label: "En attente de pièces",
      color: "text-orange-700",
      bg: "bg-orange-100",
      icon: Wrench,
    },
    FIXING_FINISHED: {
      label: "Terminée",
      color: "text-green-700",
      bg: "bg-green-100",
      icon: Car,
    },
    WAITING_FOR_APPROVAL: {
      label: "En attente d'accord",
      color: "text-purple-700",
      bg: "bg-purple-100",
      icon: Clock,
    },
    REFUSED: {
      label: "Refusé",
      color: "text-red-700",
      bg: "bg-red-100",
      icon: XCircle,
    },
    CANCELLED: {
      label: "Annulée",
      color: "text-red-700",
      bg: "bg-red-100",
      icon: Ban,
    },
    DELETED: {
      label: "Supprimée",
      color: "text-gray-700",
      bg: "bg-gray-100",
      icon: Ban,
    },
  }

  return map[status]
}

export const HISTORY_LABELS: Record<string, string> = {
  FIXING_STARTED: "Travail commencé",
  WAITING_FOR_PARTS: "En attente de pièces",
  FIXING_FINISHED: "Travail terminé",
  WAITING_FOR_APPROVAL: "En attente d'accord",
  REFUSED: "Accord refusé",
  CANCELLED: "Intervention annulée",
  DELETED: "Intervention supprimée",
}
