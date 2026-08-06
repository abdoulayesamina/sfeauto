import { WorkStatus } from "@/generated/prisma"
import { Wrench, Car, Clock } from "lucide-react"

export type UIStatus =
  | "EN_ATTENTE_ACCORD"
  | "EN_COURS"
  | "ATTENTE_PIECES"
  | "TERMINEE"

export const STATUS_UI_MAP: Record<WorkStatus, UIStatus> = {
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
}

export const UI_TO_WORKSTATUS: Record<Exclude<UIStatus, "EN_ATTENTE_ACCORD">, WorkStatus> = {
  EN_COURS: "FIXING_STARTED",
  ATTENTE_PIECES: "WAITING_FOR_PARTS",
  TERMINEE: "FIXING_FINISHED",
}

export const toUIStatus = (backendStatus?: string, accordNumber?: string | null): UIStatus => {
  if (!accordNumber) return "EN_ATTENTE_ACCORD"
  if (!backendStatus) return "EN_COURS"
  return STATUS_UI_MAP[backendStatus as WorkStatus] ?? "EN_COURS"
}

export const filterByUIStatus = (
  interventions: any[] | undefined,
  uiStatus: "ALL" | UIStatus
) => {
  if (!Array.isArray(interventions)) return []
  if (uiStatus === "ALL") return interventions
  return interventions.filter((i) => toUIStatus(i.status, i.accordNumber) === uiStatus)
}

export const getStatusMeta = (status: UIStatus) => {
  const map: Record<UIStatus, { label: string; color: string; bg: string; icon: any }> = {
    EN_ATTENTE_ACCORD: {
      label: "En attente d'accord",
      color: "text-purple-700",
      bg: "bg-purple-100",
      icon: Clock,
    },
    EN_COURS: {
      label: "En cours",
      color: "text-blue-700",
      bg: "bg-blue-100",
      icon: Wrench,
    },
    ATTENTE_PIECES: {
      label: "En attente de pièces",
      color: "text-orange-700",
      bg: "bg-orange-100",
      icon: Wrench,
    },
    TERMINEE: {
      label: "Terminée",
      color: "text-green-700",
      bg: "bg-green-100",
      icon: Car,
    },
  }

  return map[status]
}

export const HISTORY_LABELS: Record<string, string> = {
  FIXING_STARTED: "Travail commencé",
  WAITING_FOR_PARTS: "En attente de pièces",
  FIXING_FINISHED: "Travail terminé",
}
