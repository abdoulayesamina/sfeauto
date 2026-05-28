// useInterventions.api.ts
import { useState, useEffect } from "react"

export function useInterventions(
  statusFilter?: string,
  clientId?: string,
  baseId?: string,
  search?: string
) {
  const [interventions, setInterventions] = useState<any>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter) params.append("status", statusFilter)
    if (clientId) params.append("clientId", clientId)
    if (baseId) params.append("baseId", baseId)
    if (search) params.append("search", search)

    fetch(`/api/mechanic/interventions?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInterventions(data)
        } else {
          console.error("Format d'interventions invalide:", data)
          setInterventions([])
        }
      })
      .catch(err => {
        console.error("Erreur fetching interventions:", err)
        setInterventions([])
      })
      .finally(() => setLoading(false))
  }, [statusFilter, clientId, baseId, search])

  return { interventions, setInterventions, loading }
}
