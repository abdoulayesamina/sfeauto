"use client"

import { Article } from "@/src/utils/types/article"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/articles"


export function useArticleApi() {

    const getArticles = async (): Promise<Article[]> => {
        const res = await fetch(API_URL)
        const data = await res.json()
        if(!res.ok){
            throw new Error(data.error || "Erreur chargement articles")
        }
        return data.articles
    }

    const createArticle = async (data: Partial<Article>) => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error || "Erreur création article");
        }

        return result;
    }

    const updateArticle = async (id: number, data: Partial<Article>) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.error || "Erreur modification article");
        }
        return result;
    }

    const deleteArticle = async (id: number) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        })
        const result =  await res.json();
        if(!res.ok){
            throw new Error(result.error || "Erreur suppression article")
        }
        return result;
    }

    return { getArticles, createArticle, updateArticle, deleteArticle }
}