// src/services/api/use-agence.api.ts

import { API_BASE_URL } from "@/src/shared/config/api"
import { Agence } from "@/src/utils/types/agence"

const API_URL = `${API_BASE_URL}/bases` 
export function useAgenceApi() {

  // Récupérer les agences, éventuellement filtrées par client
  const getAgences = async (clientId?: string): Promise<Agence[]> => {
    // Construire l'URL avec search param si clientId existe
    let url = API_URL
    if (clientId) {
      url += `?clientId=${encodeURIComponent(clientId)}`
    }

    const res = await fetch(url, {
      method: "GET",
      credentials: "include", // si tu utilises l'auth par cookie
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Erreur lors du chargement des agences")
    }

    return res.json()
  }

  return {
    getAgences,
  }
}
