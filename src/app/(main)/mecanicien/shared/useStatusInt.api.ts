// src/app/(main)/mecanicien/shared/useStatusInt.api.ts
import { useState } from "react"
import { UI_TO_WORKSTATUS } from "@/src/utils/constants/intervention-status"
import { WorkStatus } from "@/generated/prisma"

type StatusUI = keyof typeof UI_TO_WORKSTATUS

type UpdateStatusResult =
  | { success: true; data: any }
  | { success: false; message: string; status?: number }

type UseStatusIntReturn = {
  updateStatus: (
    interventionId: string,
    newStatus: StatusUI
  ) => Promise<UpdateStatusResult>
  loading: boolean
  error: string | null
}

export function useStatusInt(): UseStatusIntReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (
    interventionId: string,
    newStatus: StatusUI
  ): Promise<UpdateStatusResult> => {
    setLoading(true)
    setError(null)

    const workStatus: WorkStatus = UI_TO_WORKSTATUS[newStatus]

    try {
      const res = await fetch(`/api/interventions/${interventionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: workStatus }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const message =
          data?.error ||
          `Erreur ${res.status}`

        setError(message)

        return {
          success: false,
          message,
          status: res.status,
        }
      }

      return {
        success: true,
        data,
      }

    } catch (err: any) {
      const message = err?.message || "Erreur réseau"
      setError(message)

      return {
        success: false,
        message,
      }
    } finally {
      setLoading(false)
    }
  }

  return { updateStatus, loading, error }
}