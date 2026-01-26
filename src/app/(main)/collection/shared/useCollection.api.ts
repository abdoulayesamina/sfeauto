import { Collection } from "@/src/utils/types/collection"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/collections"

export function useCollectionApi() {
    const getAllCollections = async (): Promise<Collection[]> => {
        const res = await fetch(API_URL)
        const data = await res.json()
        if(!res.ok){
            throw new Error(data.error || "Erreur chargement collections")
        }
        return data.collections;
    }

    const createCollection = async (data: Partial<Collection>) => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur création collection");
        }
        return result;
    }

    const updateCollection = async (data: Partial<Collection>) => {
        const res = await fetch(`${API_URL}/${data.col_id}`, {
            method: "PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur mise à jour collection");
        }
        return result;
    }

    const deleteCollection = async (id: number) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur suppression collection");
        }
        return result;
    }

    return { getAllCollections, createCollection, updateCollection, deleteCollection }
}