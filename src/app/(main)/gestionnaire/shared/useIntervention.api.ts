import { useState } from "react"
import { errorAlert, successAlert } from "@/src/lib/alerts"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/invoices"

export function useInterventionApi() {
  const [loading, setLoading] = useState(false)

  const createIntervention = async (payload: any) => {
    setLoading(true)
    try {
      const images: File[] = payload.veh_images || []

      const fd = new FormData()
      fd.append("vehicleId", payload.veh_vehicleId)
      fd.append("accordNumber", payload.veh_accordNumber ?? "")
      fd.append("dateOfConfirmation", payload.veh_dateOfConfirmation ?? "")
      fd.append("workDescription", payload.veh_workDescription ?? "")
      fd.append("didOrderParts", String(Boolean(payload.veh_didOrderParts)))
      fd.append("ordersDetails", payload.veh_ordersDetails ?? "")
      fd.append("comments", payload.veh_comments ?? "")

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
