// src/app/(main)/mecanicien/shared/useStatusInt.api.ts
import { useState } from "react"
import { UI_TO_WORKSTATUS } from "@/src/utils/constants/intervention-status"
import { WorkStatus } from "@/generated/prisma"

type StatusUI = keyof typeof UI_TO_WORKSTATUS

type UseStatusIntReturn = {
  updateStatus: (invoiceId: string, newStatus: StatusUI) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useStatusInt(): UseStatusIntReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (invoiceId: string, newStatus: StatusUI) => {
    setLoading(true)
    setError(null)

    const workStatus: WorkStatus = UI_TO_WORKSTATUS[newStatus]

    console.log(
      "[useStatusInt] PATCH invoice:",
      invoiceId,
      "newStatus UI:",
      newStatus,
      "→ WorkStatus:",
      workStatus
    )

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: workStatus }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error("[useStatusInt] PATCH failed:", data)
        setError(data?.error || "Erreur serveur inconnue")
        return false
      }

      const updated = await res.json()
      console.log("[useStatusInt] PATCH success:", updated)
      return true
    } catch (err: any) {
      console.error("[useStatusInt] PATCH exception:", err)
      setError(err?.message || "Erreur réseau")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updateStatus, loading, error }
}
