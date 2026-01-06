
"use client"

import { Agence } from "@/src/utils/types/agence"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/admin/bases"

export function useAgenceApi() {
  const getAgences = async (): Promise<Agence[]> => {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error("Erreur chargement agences")
    return res.json()
  }

  const createAgence = async (data: Partial<Agence>) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur création agence")
    }
  }

  const updateAgence = async (id: string, data: Partial<Agence>) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur mise à jour agence")
    }
  }

  const deleteAgence = async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur suppression agence")
    }
  }

  return {
    getAgences,
    createAgence,
    updateAgence,
    deleteAgence,
  }
}
