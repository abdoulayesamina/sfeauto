"use client"

import { Brand } from "@/src/utils/types/brand"

const API_URL = "/api/brands"


export function useBrandsApi() {
    const getBrands = async (): Promise<Brand[]> => {
        const res = await fetch(API_URL)
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.error || "Erreur chargement marques")
        }
        return data
    }

    const createBrand = async (name: string) => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.error || "Erreur création marque")
        }
        return result
    }

    const updateBrand = async (id: string, name: string) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.error || "Erreur modification marque")
        }
        return result
    }

    const deleteBrand = async (id: string) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.error || "Erreur suppression marque")
        }
        return result
    }

    return { getBrands, createBrand, updateBrand, deleteBrand }
}
