"use client";

import { useState } from "react";

type DevisItemInput = {
  art_id: number;
  quantite: number;
  tva?: number;
  reference?: string;
  designation?: string;
};

type CreateDevisPayload = {
  invoiceId: string;
  dev_tva?: number;
  items: DevisItemInput[];
};

export function useDevisApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createDevis(payload: CreateDevisPayload) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Erreur lors de la création du devis");
        return { ok: false as const, error: data?.error ?? "Erreur API", data: null };
      }

      return { ok: true as const, error: null, data };
    } catch (e: any) {
      setError("Erreur réseau");
      return { ok: false as const, error: "Erreur réseau", data: null };
    } finally {
      setLoading(false);
    }
  }

  return { createDevis, loading, error };
}
