// src/utils/interventions/groupInterventionsByStatus.ts

import { toUIStatus } from "@/src/utils/constants/intervention-status"

/**
 * Groupe d'affichage pour les badges de statut
 */
export type BadgeGroup = {
  uiStatus: ReturnType<typeof toUIStatus>
  count: number
}

/**
 * Regroupe les interventions par statut UI
 * - Conserve l'ordre du plus récent vers l'ancien
 * - Incrémente le compteur si plusieurs interventions ont le même statut
 */
export function groupInterventionsByStatus(
  interventions: { status: string }[]
): BadgeGroup[] {
  const map = new Map<string, BadgeGroup>()

  // On parcourt dans l'ordre reçu (chez toi : récent → ancien)
  for (const interv of interventions) {
    const uiStatus = toUIStatus(interv.status)
    const key = String(uiStatus)

    const existing = map.get(key)
    if (existing) {
      existing.count += 1
    } else {
      map.set(key, { uiStatus, count: 1 })
    }
  }

  // L'ordre d'insertion dans la Map est conservé
  return Array.from(map.values())
}
