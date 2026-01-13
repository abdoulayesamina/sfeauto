import { Vehicule } from "@/src/utils/types/vehicule"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/client/vehicles"

export function useVehiculesApi() {
  const getVehicules = async (): Promise<{ vehicles: Vehicule[], bases: any[], stats: any }> => {
    const res = await fetch(API_URL)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur chargement véhicules")
    }
    return res.json()
  }

  return { getVehicules }
}
