// src/utils/constants/intervention-status.ts

import { prisma, WorkStatus } from '@/generated/prisma'


export const STATUS_UI_MAP: Record<WorkStatus, string> = {
  CONFIRMED_IN_PLANNING: "EN_COURS",
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
}

export const UI_TO_WORKSTATUS: Record<'EN_COURS' | 'ATTENTE_PIECES' | 'TERMINEE', WorkStatus> = {
  EN_COURS: "FIXING_STARTED",
  ATTENTE_PIECES: "WAITING_FOR_PARTS",
  TERMINEE: "FIXING_FINISHED",
}

