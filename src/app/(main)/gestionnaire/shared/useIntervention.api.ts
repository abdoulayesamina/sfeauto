import { useState } from "react"
import { errorAlert, successAlert } from "@/src/lib/alerts"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/invoices"

export function useInterventionApi() {
  const [loading, setLoading] = useState(false)

  const createIntervention = async (payload: any) => {
    setLoading(true)
    try {
      const images: File[] = payload.images || []

      const fd = new FormData()
      fd.append("vehicleId", payload.vehicleId)
      fd.append("accordNumber", payload.accordNumber ?? "")
      fd.append("dateOfConfirmation", payload.dateOfConfirmation ?? "")
      fd.append("workDescription", payload.workDescription ?? "")
      fd.append("didOrderParts", String(Boolean(payload.didOrderParts)))
      fd.append("ordersDetails", payload.ordersDetails ?? "")
      fd.append("comments", payload.comments ?? "")

      for (const f of images) {
        fd.append("photos", f)
      }

      const res = await fetch(API_URL, {
        method: "POST",
        body: fd,
        credentials: "include",
      })

      const result = await res.json()

      if (!res.ok) {
        errorAlert("Erreur création intervention", result.error || "Erreur inconnue")
        throw new Error(result.error || "Erreur inconnue")
      }

      successAlert(
        result.message || "Intervention créée avec succès"
      )

      return result
    } catch (e: any) {
      errorAlert("Erreur", e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { createIntervention, loading }
}
