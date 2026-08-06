// src/app/(main)/mecanicien/shared/useStatusInt.api.ts
import { useState } from "react"
import { UI_TO_WORKSTATUS, UIStatus } from "@/src/utils/constants/intervention-status"

type UpdateStatusResult =
  | { success: true; data: any }
  | { success: false; message: string; status?: number }

type UseStatusIntReturn = {
  updateStatus: (
    interventionId: string,
    newStatus: UIStatus
  ) => Promise<UpdateStatusResult>
  loading: boolean
  error: string | null
}

export function useStatusInt(): UseStatusIntReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (
    interventionId: string,
    newStatus: UIStatus
  ): Promise<UpdateStatusResult> => {
    setLoading(true)
    setError(null)

    try {
      const isWaitingForApproval = newStatus === "EN_ATTENTE_ACCORD"

      const res = await fetch(`/api/interventions/${interventionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isWaitingForApproval
            ? { waitingForApproval: true }
            : { status: UI_TO_WORKSTATUS[newStatus] }
        ),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const message = data?.error || `Erreur ${res.status}`
        setError(message)
        return { success: false, message, status: res.status }
      }

      return { success: true, data }
    } catch (err: any) {
      const message = err?.message || "Erreur réseau"
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  return { updateStatus, loading, error }
}