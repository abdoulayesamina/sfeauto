"use client"

import { Intervention } from "@/src/utils/types/intervention"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/client/interventions"

export function useInterventionsApi() {
  // Recherche d'interventions par plaque
  const searchInterventions = async (search: string): Promise<Intervention[]> => {
    if (!search.trim()) throw new Error("Recherche requise")

    const url = new URL(API_URL)
    url.searchParams.set("search", search)

    const res = await fetch(url.toString())
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur chargement interventions")
    }

    return res.json()
  }

  return {
    searchInterventions,
  }
}
