"use client"

import { Model } from "@/src/utils/types/model"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/models"

export function useModelsApi() {
    const getModels = async (brandId: string): Promise<Model[]> => {
        const res = await fetch(`${API_URL}?brandId=${brandId}`)
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.error || "Erreur chargement modèles")
        }
        return data
    }

    const createModel = async (name: string, brandId: string) => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, brandId }),
        })
        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.error || "Erreur création modèle")
        }
        return result
    }

    const updateModel = async (id: string, name: string) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.error || "Erreur modification modèle")
        }
        return result
    }

    const deleteModel = async (id: string) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.error || "Erreur suppression modèle")
        }
        return result
    }

    return { getModels, createModel, updateModel, deleteModel }
}
