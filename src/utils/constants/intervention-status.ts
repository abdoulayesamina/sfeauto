// src/utils/constants/intervention-status.ts
import { WorkStatus } from '@/generated/prisma'
import { Wrench, Car } from "lucide-react"


export const STATUS_UI_MAP: Record<WorkStatus, "EN_COURS" | "ATTENTE_PIECES" | "TERMINEE"> = {
  CONFIRMED_IN_PLANNING: "EN_COURS",
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
}

export const UI_TO_WORKSTATUS: Record<"EN_COURS" | "ATTENTE_PIECES" | "TERMINEE", WorkStatus> = {
  EN_COURS: "FIXING_STARTED",
  ATTENTE_PIECES: "WAITING_FOR_PARTS",
  TERMINEE: "FIXING_FINISHED",
}

/**
 * Transforme un statut backend en statut front (EN_COURS, TERMINEE, ATTENTE_PIECES)
 */
export const toUIStatus = (backendStatus?: string): "EN_COURS" | "ATTENTE_PIECES" | "TERMINEE" => {
  if (!backendStatus) return "EN_COURS" 
  return STATUS_UI_MAP[backendStatus as WorkStatus] ?? "EN_COURS"
}

/**
 * Filtre les interventions selon le statut UI sélectionné
 */
export const filterByUIStatus = (
  interventions: any[] | undefined,
  uiStatus: "ALL" | "EN_COURS" | "TERMINEE" | "ATTENTE_PIECES"
) => {
  if (!Array.isArray(interventions)) return []
  if (uiStatus === "ALL") return interventions
  return interventions.filter(i => toUIStatus(i.status) === uiStatus)
}

export const getStatusMeta = (status: "EN_COURS" | "ATTENTE_PIECES" | "TERMINEE") => {
  const map = {
    EN_COURS: { label: "En cours", color: "text-blue-700", bg: "bg-blue-100", icon: Wrench },
    ATTENTE_PIECES: { label: "En attente de pièces", color: "text-orange-700", bg: "bg-orange-100", icon: Wrench },
    TERMINEE: { label: "Terminée", color: "text-green-700", bg: "bg-green-100", icon: Car },
  }

  return map[status] ?? { label: "Statut inconnu", color: "text-gray-500", bg: "bg-gray-100", icon: Wrench }
}


export const HISTORY_LABELS: Record<string, string> = {
  CONFIRMED_IN_PLANNING: "Confirmée et planifiée",
  FIXING_STARTED: "Travail commencé",
  WAITING_FOR_PARTS: "En attente de pièces",
  FIXING_FINISHED: "Travail terminé",
}
