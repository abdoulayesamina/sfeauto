// src/services/api/useAgenceClient.ts

import { API_BASE_URL } from "@/src/shared/config/api"

type WorkStatus =
  | "CONFIRMED_IN_PLANNING"
  | "WAITING_FOR_PARTS"
  | "FIXING_STARTED"
  | "FIXING_FINISHED"

export type AgenceIntervention = {
  id: string
  invoiceConfirmed: boolean
  status: WorkStatus
  accordNumber: string | null
  dateOfConfirmation: string | null
  statusUpdatedAt: string
  workDescription: string | null
  didOrderParts: boolean
  ordersDetails: string | null
  comments: string | null
  createdAt: string
  updatedAt: string

  vehicle: {
    id: string
    licensePlate: string
    brand: string | null
    model: string | null
    year: number | null
    color: string | null
    client: { id: string; name: string }
    base: { id: string; location: string; clientId: string }
  }

  photos: { id: string; url: string }[]
  handledBy: { id: string; name: string; email: string } | null
  devis: { dev_id: number; dev_numdevis: string }[]
}

export type AgenceInterventionsResponse = {
  total: number
  take: number
  skip: number
  baseId: string | null
  interventions: AgenceIntervention[]
}

type ListParams = {
  search?: string
  status?: WorkStatus
  take?: number
  skip?: number
  // utile si tu veux autoriser ADMIN/MANAGER à filtrer par base
  baseId?: string
}

const API_URL = `${API_BASE_URL}/agence/interventions`

function buildQuery(params?: ListParams) {
  const q = new URLSearchParams()

  if (params?.search) q.set("search", params.search)
  if (params?.status) q.set("status", params.status)
  if (params?.take != null) q.set("take", String(params.take))
  if (params?.skip != null) q.set("skip", String(params.skip))
  if (params?.baseId) q.set("baseId", params.baseId)

  const qs = q.toString()
  return qs ? `?${qs}` : ""
}

export function useAgenceClient() {
  const listInterventions = async (params?: ListParams): Promise<AgenceInterventionsResponse> => {
    const res = await fetch(`${API_URL}${buildQuery(params)}`, {
      method: "GET",
      credentials: "include",
    })

    if (!res.ok) {
      // tente de lire le message serveur
      let msg = "Erreur lors du chargement des interventions"
      try {
        const err = await res.json()
        msg = err?.error || msg
      } catch {}
      throw new Error(msg)
    }

    return res.json()
  }

  return {
    listInterventions,
  }
}
