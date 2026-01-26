import { Famille } from "@/src/utils/types/famille";

export function useFamilleApi() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL + "/familles"

    const getAllFamilles = async (): Promise<Famille[]> => {
        const res = await fetch(API_URL)
        const data = await res.json()
        if(!res.ok){
            throw new Error(data.error || "Erreur lors du chargement familles")
        }
        return data.familles;
    }

    const createFamille = async (data: Partial<Famille>) => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur lors de la création famille");
        }
        return result;
    }

    const updateFamille = async (data: Partial<Famille>) => {
        const res = await fetch(API_URL + "/" + data.fam_id, {
            method: "PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur lors de la modification famille");
        }
        return result;
    }

    const deleteFamille = async (id: number) => {
        const res = await fetch(API_URL + "/" + id, {
            method: "DELETE",
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur lors de la suppression famille");
        }
        return result;
    }

    return { getAllFamilles, createFamille, updateFamille, deleteFamille }
}