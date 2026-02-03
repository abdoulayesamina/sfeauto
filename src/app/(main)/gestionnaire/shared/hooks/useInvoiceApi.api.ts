"use client";

import { useState } from "react";
import { errorAlert, successAlert } from "@/src/lib/alerts";

export type InvoicePatchPayload = Partial<{
  accordNumber: string | null;
  dateOfConfirmation: string | null; // ISO ou YYYY-MM-DD
  workDescription: string | null;
  didOrderParts: boolean;
  ordersDetails: string | null;
  comments: string | null;
}>;

export function useInvoiceApi() {
  const [loading, setLoading] = useState(false);

  const patchInvoice = async (id: string, payload: InvoicePatchPayload) => {
    setLoading(true);
    try {
      if (!id) throw new Error("ID intervention manquant");

      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error ?? "Erreur lors de la mise à jour";
        errorAlert("Erreur modification intervention", msg);
        throw new Error(msg);
      }

      successAlert("Intervention modifiée avec succès");
      return { ok: true as const, data };
    } finally {
      setLoading(false);
    }
  };

  return { patchInvoice, loading };
}
