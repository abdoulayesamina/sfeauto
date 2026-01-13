// src/utils/constants/intervention-status.ts
import { WorkStatus } from '@/generated/prisma'

// Mapping du backend vers UI
export const STATUS_UI_MAP: Record<WorkStatus, "EN_COURS" | "ATTENTE_PIECES" | "TERMINEE"> = {
  CONFIRMED_IN_PLANNING: "EN_COURS",
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
}

// Mapping inverse (UI vers backend)
export const UI_TO_WORKSTATUS: Record<"EN_COURS" | "ATTENTE_PIECES" | "TERMINEE", WorkStatus> = {
  EN_COURS: "FIXING_STARTED",
  ATTENTE_PIECES: "WAITING_FOR_PARTS",
  TERMINEE: "FIXING_FINISHED",
}

/**
 * Transforme un statut backend en statut front (EN_COURS, TERMINEE, ATTENTE_PIECES)
 */
export const toUIStatus = (backendStatus?: string): "EN_COURS" | "ATTENTE_PIECES" | "TERMINEE" => {
  if (!backendStatus) return "EN_COURS" // valeur par défaut si absent
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
