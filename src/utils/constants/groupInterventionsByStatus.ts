import { toUIStatus, computeUIStatus } from "@/src/utils/constants/intervention-status"

export type BadgeGroup = {
  uiStatus: ReturnType<typeof toUIStatus>
  count: number
}

export function groupInterventionsByStatus(
  interventions: { int_status: string; int_accordNumber?: string | null; int_annulee?: boolean; int_supprimee?: boolean }[]
): BadgeGroup[] {
  const map = new Map<string, BadgeGroup>()

  for (const interv of interventions) {
    if (interv.int_supprimee) continue

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
