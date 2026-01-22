import { useState } from "react"
import { errorAlert, successAlert } from "@/src/lib/alerts"
import { CreateInterventionData } from "@/src/utils/types/intervention"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/invoices"

export function useInterventionApi() {
  const [loading, setLoading] = useState(false)

  const createIntervention = async (data: any) => {
    console.log("[InterventionApi] Création intervention, données envoyées :", data)
    setLoading(true)

    try {
      const hasImages = Array.isArray(data?.images) && data.images.length > 0

      let res: Response

      if (hasImages) {
        // ✅ multipart/form-data : intervention + images
        const fd = new FormData()
        fd.append("vehicleId", data.vehicleId)
        fd.append("accordNumber", data.accordNumber ?? "")
        fd.append("dateOfConfirmation", data.dateOfConfirmation ?? "")
        fd.append("workDescription", data.workDescription ?? "")
        fd.append("didOrderParts", String(Boolean(data.didOrderParts)))
        fd.append("ordersDetails", data.ordersDetails ?? "")
        fd.append("comments", data.comments ?? "")

        // photos[] multiples
        for (const file of data.images as File[]) {
          fd.append("photos", file)
        }

        res = await fetch(API_URL, {
          method: "POST",
          body: fd,
        })
      } else {
        // ✅ JSON : intervention sans images
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data as CreateInterventionData),
        })
      }

      const resultText = await res.text()
      console.log("[InterventionApi] Réponse brute du serveur :", resultText)

      let result: any
      try {
        result = JSON.parse(resultText)
      } catch (e) {
        console.error("[InterventionApi] Impossible de parser JSON :", e)
        throw new Error("Réponse serveur invalide")
      }

      if (!res.ok) {
        console.error("[InterventionApi] Erreur serveur :", result)
        errorAlert("Erreur création intervention", result.error || "Erreur inconnue")
        throw new Error(result.error || "Erreur inconnue")
      }

      console.log("[InterventionApi] Intervention créée avec succès :", result)
      successAlert("Intervention créée avec succès")
      return result
    } catch (e: any) {
      console.error("[InterventionApi] Exception attrapée :", e)
      errorAlert("Erreur création intervention", e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { createIntervention, loading }
}
