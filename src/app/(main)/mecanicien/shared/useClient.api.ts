// useClients.api.ts
import { useState, useEffect } from "react"

export function useClients() {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/mechanic/clients")
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { clients, loading }
}
