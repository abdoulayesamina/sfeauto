import { WorkStatus } from "@/generated/prisma"
import { Wrench, Car, Clock, XCircle, Ban } from "lucide-react"

export type UIStatus =
  | "EN_ATTENTE_ACCORD"
  | "REFUSE"
  | "ANNULEE"
  | "EN_COURS"
  | "ATTENTE_PIECES"
  | "TERMINEE"

export const STATUS_UI_MAP: Record<WorkStatus, UIStatus> = {
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
}

export const UI_TO_WORKSTATUS: Record<Exclude<UIStatus, "EN_ATTENTE_ACCORD" | "REFUSE" | "ANNULEE">, WorkStatus> = {
  EN_COURS: "FIXING_STARTED",
  ATTENTE_PIECES: "WAITING_FOR_PARTS",
  TERMINEE: "FIXING_FINISHED",
}

export const toUIStatus = (backendStatus?: string, accordNumber?: string | null): UIStatus => {
  if (!backendStatus) return "EN_COURS"
  if (accordNumber === "REFUSE") return "REFUSE"
  if (accordNumber === null) return "EN_ATTENTE_ACCORD"
  return STATUS_UI_MAP[backendStatus as WorkStatus] ?? "EN_COURS"
}

export const computeUIStatus = (intervention: {
  int_status?: string;
  int_accordNumber?: string | null;
  int_annulee?: boolean;
  int_supprimee?: boolean;
}): UIStatus => {
  if (intervention.int_supprimee) return "ANNULEE"
  if (intervention.int_annulee) return "ANNULEE"
  return toUIStatus(intervention.int_status, intervention.int_accordNumber)
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
    REFUSE: {
      label: "Refusé",
      color: "text-red-700",
      bg: "bg-red-100",
      icon: XCircle,
    },
    ANNULEE: {
      label: "Annulée",
      color: "text-red-700",
      bg: "bg-red-100",
      icon: Ban,
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
