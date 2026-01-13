"use client"

import { useState, useEffect } from "react"

/**
 * Hook pour récupérer l'historique des statuts d'une facture
 * @param invoiceId - l'ID de la facture sélectionnée
 */
export function useHistoryStatus(invoiceId: string | undefined) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!invoiceId) return

    setLoading(true)
    setError(null)

    // Appel au endpoint existant
    fetch(`/api/invoices`, {
      credentials: "include", // important pour envoyer les cookies de session
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("Non autorisé")
          if (res.status === 403) throw new Error("Accès refusé")
          throw new Error(`Erreur réseau (${res.status})`)
        }

        const data = await res.json()

        // Cherche l'intervention correspondant à invoiceId
        const invoice = data.find((inv: any) => inv.id === invoiceId)

        if (!invoice) {
          setHistory([])
        } else {
          // Tri au cas où l'API ne renvoie pas l'ordre exact
          const sortedHistory = (invoice.statusHistory || []).sort(
            (a: any, b: any) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
          )
          setHistory(sortedHistory)
        }
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || "Impossible de charger l'historique")
      })
      .finally(() => setLoading(false))
  }, [invoiceId])

  return { history, loading, error }
}
