// useBases.api.ts
import { useState, useEffect } from "react"

export function useBases(clientId?: string) {
  const [bases, setBases] = useState<{ id: string; location: string; client: { id: string; name: string } }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let url = "/api/mechanic/bases"
    if (clientId) url += `?clientId=${clientId}`

    fetch(url)
      .then(res => res.json())
      .then(data => setBases(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [clientId])

  return { bases, loading }
}
