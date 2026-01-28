import { Remise } from "@/src/utils/types/remise"

export function useRemiseApi(){
    const API_URL = process.env.NEXT_PUBLIC_API_URL + "/remise"

    const getAllRemises = async (): Promise<Remise[]> => {
        const res = await fetch(API_URL)
        const data = await res.json()
        if(!res.ok){
            throw new Error(data.error || "Erreur lors du chargement des remises")
        }
        return data.remises;
    }

    const createRemise = async (data: Partial<Remise>) => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur lors de la création de remise");
        }
        return result;
    }

    const updateRemise = async (data: Partial<Remise>) => {
        const res = await fetch(API_URL + "/" + data.rem_id, {
            method: "PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur lors de la modification remise");
        }
        return result;
    }
    
    const deleteRemise = async (id: number) => {
        const res = await fetch(API_URL + "/" + id, {
            method: "DELETE",
        })
        const result = await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur lors de la suppression de la remise");
        }
        return result;
    }

    return {getAllRemises, createRemise, updateRemise, deleteRemise}
    
}