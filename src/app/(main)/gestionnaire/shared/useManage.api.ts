// src/app/(main)/gestionnaire/shared/useManage.api.ts
import { Vehicule } from "@/src/utils/types/vehicule"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/vehicles"


export function useManageApi() {

    const searchVehicles = async (search?: string): Promise<Vehicule[]> => {
    const res = await fetch(
      search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL,
      { method: "GET" }
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur lors de la recherche")
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
      throw new Error(err.error || "Erreur lors de la création")
    }

    return res.json()
  }

  return {
    searchVehicles,
    createVehicle,
  }
}
