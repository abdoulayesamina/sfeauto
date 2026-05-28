// useClients.api.ts
import { useState, useEffect } from "react"

export function useClients() {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/mechanic/clients")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data)
        } else {
          console.error("Format de clients invalide:", data)
          setClients([])
        }
      })
      .catch(err => {
        console.error("Erreur fetching clients:", err)
        setClients([])
      })
      .finally(() => setLoading(false))
  }, [])

  return { clients, loading }
}
