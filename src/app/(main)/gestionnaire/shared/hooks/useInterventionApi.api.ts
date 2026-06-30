"use client";

import { useState } from "react";
import { errorAlert, successAlert } from "@/src/lib/alerts";
import { formatAccordConflictHtml } from "@/src/utils/accordConflict";

export type InterventionPatchPayload = Partial<{
  accordNumber: string | null;
  dateOfConfirmation: string | null; // ISO ou YYYY-MM-DD
  workDescription: string | null;
  didOrderParts: boolean;
  ordersDetails: string | null;
  comments: string | null;
  kilometrage: string | null;
}>;

export function useInterventionApi() {
  const [loading, setLoading] = useState(false);

  const patchIntervention = async (id: string, payload: InterventionPatchPayload) => {
    setLoading(true);
    try {
      if (!id) throw new Error("ID intervention manquant");

      const res = await fetch(`/api/interventions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error ?? "Erreur lors de la mise à jour";

        if (data?.code === "ACCORD_NUMBER_ALREADY_EXISTS" && data?.details) {
          errorAlert(msg, undefined, formatAccordConflictHtml(data.details));
        } else {
          errorAlert("Erreur modification intervention", msg);
        }

        throw new Error(msg);
      }

      successAlert("Intervention modifiée avec succès");
      return { ok: true as const, data };
    } finally {
      setLoading(false);
    }
  };

  return { patchIntervention, loading };
}
