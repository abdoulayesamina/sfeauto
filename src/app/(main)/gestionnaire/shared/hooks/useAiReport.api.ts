"use client"

import { useState } from "react"

export type AiReportStyle = "technique" | "client" | "assurance"

export type AiReport = Record<AiReportStyle, string>

export function useAiReport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async (interventionId: string): Promise<AiReport | null> => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/interventions/${interventionId}/ai-report`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de la génération du compte-rendu")
      }

      return data.report as AiReport
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generateReport, loading, error }
}
