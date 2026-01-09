import { errorAlert, successAlert } from "@/src/lib/alerts"
import { CreateInterventionData } from "@/src/utils/types/intervention"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/invoices"

export function useInterventionApi() {
  const createIntervention = async (data: CreateInterventionData) => {
    console.log("[InterventionApi] Création intervention, données envoyées :", data)

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const resultText = await res.text()
      console.log("[InterventionApi] Réponse brute du serveur :", resultText)

      let result
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
    }
  }

  return { createIntervention }
}
