import { Vehicule } from "@/src/utils/types/vehicule"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/vehicles"

export type GetVehiclesOptions = {
  page?: number
  pageSize?: number
  clientId?: string
  agenceId?: string
  statut?: string
  accordSearch?: string
}

export type GetVehiclesResult = {
  vehicles: Vehicule[]
  total: number
  totalPages: number
  stats: {
    total: number
    enCours: number
    terminees: number
    attente: number
    attenteAccord: number
    annulees: number
    refusees: number
  }
}

export function useManageApi() {
  const getVehicles = async (options?: GetVehiclesOptions): Promise<GetVehiclesResult> => {
    const params = new URLSearchParams()

    if (options?.page) params.set("page", String(options.page))
    if (options?.pageSize) params.set("pageSize", String(options.pageSize))
    if (options?.clientId) params.set("clientId", options.clientId)
    if (options?.agenceId) params.set("agenceId", options.agenceId)
    if (options?.statut) params.set("statut", options.statut)
    if (options?.accordSearch) params.set("accordSearch", options.accordSearch)

    const qs = params.toString()
    const url = qs ? `${API_URL}?${qs}` : API_URL

    const res = await fetch(url)

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur chargement véhicules")
    }

    return res.json()
  }

  const searchVehicles = async (search: string): Promise<GetVehiclesResult> => {
    const res = await fetch(`${API_URL}?search=${encodeURIComponent(search)}`)

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur recherche véhicule")
    }

    return res.json()
  }

  const createVehicle = async (data: Partial<Vehicule>) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur création véhicule")
    }

    return res.json()
  }

  const setVehicleAbsence = async (vehicleId: string, absent: boolean) => {
    const res = await fetch(`${API_URL}/${vehicleId}/absence`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ absent }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Erreur mise à jour absence véhicule")
    }

    return res.json()
  }

  return {
    getVehicles,
    searchVehicles,
    createVehicle,
    setVehicleAbsence,
  }
}
