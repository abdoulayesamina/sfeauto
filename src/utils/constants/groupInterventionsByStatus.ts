// src/utils/interventions/groupInterventionsByStatus.ts

import { toUIStatus } from "@/src/utils/constants/intervention-status"


export type BadgeGroup = {
  uiStatus: ReturnType<typeof toUIStatus>
  count: number
}



export function groupInterventionsByStatus(
  interventions: { status: string }[]
): BadgeGroup[] {
  const map = new Map<string, BadgeGroup>()

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

  return Array.from(map.values())
}
