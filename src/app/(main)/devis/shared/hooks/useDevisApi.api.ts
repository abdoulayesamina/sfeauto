"use client";

import { Devis } from "@/src/utils/types/devis";
import { useCallback, useState } from "react";

export type DevisItemInput = {
  art_id: number;
  quantite: number;
  tva?: number;
  reference?: string | null;
  designation?: string | null;
};

export type CreateDevisPayload = {
  interventionId: string;
  dev_tva?: number;
  items: DevisItemInput[];
};

export type PatchDevisPayload = Partial<{
  dev_tva: number | null;
  items: DevisItemInput[]; // si tu veux remplacer toutes les lignes d’un coup
}>;

type ApiResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: string };

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function useDevisApi() {
   const API_URL = process.env.NEXT_PUBLIC_API_URL + "/devis"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDevis = useCallback(async (payload: CreateDevisPayload): Promise<ApiResult<any>> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.error ?? "Erreur lors de la création du devis";
        setError(msg);
        return { ok: false, data: null, error: msg };
      }

      return { ok: true, data, error: null };
    } catch {
      const msg = "Erreur réseau";
      setError(msg);
      return { ok: false, data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);


  async function getAllDevis() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL);

      const data = await res.json();

      if (!res.ok) {
        setError("Erreur lors de la récupération des devis");
        return { ok: false as const, error: "Erreur API", data: null };
      }

      return data.devis;

    } catch {
      setError("Erreur réseau");
      return { ok: false as const, error: "Erreur réseau", data: null };
    } finally {
      setLoading(false);
    }
  }

  // async function getDevisById(id: number | string) {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //   const res = await fetch(`${API_URL}/${id}`);

  //     const data = await res.json();

  //     if (!res.ok) {
  //       setError("Erreur lors de la récupération du devis");
  //       return { ok: false as const, error: "Erreur API", data: null };
  //     }

  //     return data;

  //   } catch {
  //     setError("Erreur réseau");
  //     return { ok: false as const, error: "Erreur réseau", data: null };
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const listDevis = useCallback(async (): Promise<ApiResult<any>> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/devis", {
        method: "GET",
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.error ?? "Erreur lors du chargement des devis";
        setError(msg);
        return { ok: false, data: null, error: msg };
      }

      return { ok: true, data, error: null };
    } catch {
      const msg = "Erreur réseau";
      setError(msg);
      return { ok: false, data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDevisById = useCallback(async (dev_id: number): Promise<ApiResult<any>> => {
    setLoading(true);
    setError(null);

    try {

      const res = await fetch(`/api/devis/${dev_id}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.error ?? "Erreur lors du chargement du devis";
        setError(msg);
        return { ok: false, data: null, error: msg };
      }
      
      return { ok: true, data, error: null };
    } catch {
      const msg = "Erreur réseau";
      setError(msg);
      return { ok: false, data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const patchDevis = useCallback(async (dev_id: number, payload: PatchDevisPayload): Promise<ApiResult<any>> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/devis/${dev_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.error ?? "Erreur lors de la mise à jour du devis";
        setError(msg);
        return { ok: false, data: null, error: msg };
      }

      return { ok: true, data, error: null };
    } catch {
      const msg = "Erreur réseau";
      setError(msg);
      return { ok: false, data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDevis = useCallback(async (dev_id: number): Promise<ApiResult<any>> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/devis/${dev_id}`, { method: "DELETE" });
      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.error ?? "Erreur suppression devis";
        setError(msg);
        return { ok: false, data: null, error: msg };
      }

      return { ok: true, data, error: null };
    } catch {
      const msg = "Erreur réseau";
      setError(msg);
      return { ok: false, data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);


  async function validateDevis(dev_id: number, dev_accordNumber: string) {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch(`/api/devis/${dev_id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dev_accordNumber }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.error ?? "Erreur validation devis";
      setError(msg);
      return { ok: false as const, error: msg, data: null };
    }

    return { ok: true as const, error: null, data };
  } catch {
    const msg = "Erreur réseau";
    setError(msg);
    return { ok: false as const, error: msg, data: null };
  } finally {
    setLoading(false);
  }
}

  return {
    createDevis,
    listDevis,
    getDevisById,
    patchDevis,
    deleteDevis,
    validateDevis,
    getAllDevis,
    loading,
    error,
  };
}
