import { Vehicule } from "@/src/utils/types/vehicule"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/vehicles"

export function useManageApi() {
  const getVehicles = async (options?: { includeInvoices?: boolean }): Promise<any> => {
    const url = options?.includeInvoices ? `${API_URL}?includeInvoices=true` : API_URL

    const res = await fetch(url)

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur chargement véhicules")
    }

    return res.json()
  }

  const searchVehicles = async (search: string): Promise<Vehicule[]> => {
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

  return {
    getVehicles,
    searchVehicles,
    createVehicle,
  }
}
