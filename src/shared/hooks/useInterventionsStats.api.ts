export type InterventionsStatsOptions = {
  clientId?: string
  agenceId?: string
  search?: string
  date?: string
}

export type InterventionsStatsResult = {
  interventions: any[]
  stats: {
    total: number
    enCours: number
    terminees: number
    attente: number
    attenteAccord: number
    annulees: number
    refusees: number
    sansIntervention: number
  }
}

export function useInterventionsStatsApi() {
  const getInterventionsStats = async (
    options?: InterventionsStatsOptions
  ): Promise<InterventionsStatsResult> => {
    const params = new URLSearchParams()

    if (options?.clientId) params.set("clientId", options.clientId)
    if (options?.agenceId) params.set("agenceId", options.agenceId)
    if (options?.search) params.set("search", options.search)
    if (options?.date) params.set("date", options.date)

    const qs = params.toString()
    const url = `${process.env.NEXT_PUBLIC_API_URL}/interventions${qs ? `?${qs}` : ""}`

    const res = await fetch(url, { credentials: "include" })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Erreur chargement des interventions")
    }

    return res.json()
  }

  return { getInterventionsStats }
}
