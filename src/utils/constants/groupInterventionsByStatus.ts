import { computeUIStatus } from "@/src/utils/constants/intervention-status"
import type { InterventionStatus } from "@/generated/prisma"

export type BadgeGroup = {
  uiStatus: InterventionStatus
  count: number
}

export function groupInterventionsByStatus(
  interventions: { int_status?: InterventionStatus; int_accordNumber?: string | null; int_annulee?: boolean; int_supprimee?: boolean }[]
): BadgeGroup[] {
  const map = new Map<string, BadgeGroup>()

  for (const interv of interventions) {
    const uiStatus = computeUIStatus(interv)
    const key = String(uiStatus)
    const existing = map.get(key)
    if (existing) {
      existing.count += 1
    } else {
      map.set(key, { uiStatus, count: 1 })
    }
  }

  return Array.from(map.values())
}
