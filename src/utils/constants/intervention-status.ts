// src/utils/constants/intervention-status.ts

import { WorkStatus } from '@/generated/prisma'
import { Wrench, Car, Clock } from "lucide-react"

/**
 * Types UI clairs et distincts
 */
export type UIStatus =
  | "EN_COURS"
  | "ATTENTE_PIECES"
  | "TERMINEE"

/**
 * Mapping BACKEND → UI
 */
export const STATUS_UI_MAP: Record<WorkStatus, UIStatus> = {
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
}

/**
 * Mapping UI → BACKEND
 */
export const UI_TO_WORKSTATUS: Record<UIStatus, WorkStatus> = {
  EN_COURS: "FIXING_STARTED",
  ATTENTE_PIECES: "WAITING_FOR_PARTS",
  TERMINEE: "FIXING_FINISHED",
}

/**
 * Convertit backend → UI
 */
export const toUIStatus = (backendStatus?: string): UIStatus => {
  if (!backendStatus) return "EN_COURS"
  return STATUS_UI_MAP[backendStatus as WorkStatus] ?? "EN_COURS"
}

/**
 * Filtre liste par statut UI
 */
export const filterByUIStatus = (
  interventions: any[] | undefined,
  uiStatus: "ALL" | UIStatus
) => {
  if (!Array.isArray(interventions)) return []
  if (uiStatus === "ALL") return interventions
  return interventions.filter(i => toUIStatus(i.status) === uiStatus)
}

/**
 * Meta affichage (label + couleur + icône)
 */
export const getStatusMeta = (status: UIStatus) => {
  const map = {
    // CONFIRMEE: {
    //   label: "Confirmée",
    //   color: "text-gray-700",
    //   bg: "bg-gray-100",
    //   icon: Clock,
    // },
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

/**
 * Labels pour historique backend
 */
export const HISTORY_LABELS: Record<string, string> = {
  FIXING_STARTED: "Travail commencé",
  WAITING_FOR_PARTS: "En attente de pièces",
  FIXING_FINISHED: "Travail terminé",
}
// CONFIRMED_IN_PLANNING: "Confirmée et planifiée",






// // src/utils/constants/intervention-status.ts
// import { WorkStatus } from '@/generated/prisma'
// import { Wrench, Car } from "lucide-react"

// /**
//  * Mapping du statut backend vers un statut UI plus lisible
//  * ATTENTE_REPARATION = "En attente de réparation"
//  * ATTENTE_PIECES = "En attente de pièces"
//  * TERMINEE = "Terminée"
//  */
// export const STATUS_UI_MAP: Record<WorkStatus, "ATTENTE_REPARATION" | "ATTENTE_PIECES" | "TERMINEE"> = {
//   CONFIRMED_IN_PLANNING: "ATTENTE_REPARATION", 
//   FIXING_STARTED: "ATTENTE_REPARATION",     
//   WAITING_FOR_PARTS: "ATTENTE_PIECES",       
//   FIXING_FINISHED: "TERMINEE",        
       
// }


// export const UI_TO_WORKSTATUS: Record<"ATTENTE_REPARATION" | "ATTENTE_PIECES" | "TERMINEE", WorkStatus> = {
//   ATTENTE_REPARATION: "FIXING_STARTED",
//   ATTENTE_PIECES: "WAITING_FOR_PARTS",
//   TERMINEE: "FIXING_FINISHED",
// }


// export const toUIStatus = (
//   backendStatus?: string
// ): "ATTENTE_REPARATION" | "ATTENTE_PIECES" | "TERMINEE" => {
//   if (!backendStatus) return "ATTENTE_REPARATION"
//   return STATUS_UI_MAP[backendStatus as WorkStatus] ?? "ATTENTE_REPARATION"
// }


// export const filterByUIStatus = (
//   interventions: any[] | undefined,
//   uiStatus: "ALL" | "ATTENTE_REPARATION" | "ATTENTE_PIECES" | "TERMINEE"
// ) => {
//   if (!Array.isArray(interventions)) return []
//   if (uiStatus === "ALL") return interventions
//   return interventions.filter(i => toUIStatus(i.status) === uiStatus)
// }


// export const getStatusMeta = (
//   status: "ATTENTE_REPARATION" | "ATTENTE_PIECES" | "TERMINEE"
// ) => {
//   const map = {
//     ATTENTE_REPARATION: {
//       label: "En attente de réparation",
//       color: "text-blue-700",
//       bg: "bg-blue-100",
//       icon: Wrench,
//     },
//     ATTENTE_PIECES: {
//       label: "En attente de pièces",
//       color: "text-orange-700",
//       bg: "bg-orange-100",
//       icon: Wrench,
//     },
//     TERMINEE: {
//       label: "Terminée",
//       color: "text-green-700",
//       bg: "bg-green-100",
//       icon: Car,
//     },
//   }

//   return map[status] ?? {
//     label: "Statut inconnu",
//     color: "text-gray-500",
//     bg: "bg-gray-100",
//     icon: Wrench,
//   }
// }


// export const HISTORY_LABELS: Record<string, string> = {
//   CONFIRMED_IN_PLANNING: "Confirmée et planifiée",
//   FIXING_STARTED: "Travail commencé",
//   WAITING_FOR_PARTS: "En attente de pièces",
//   FIXING_FINISHED: "Travail terminé",                                                      
// }

