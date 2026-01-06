// src/services/api/use-user.api.ts

import { API_BASE_URL } from "@/src/shared/config/api"
import { User } from "@/src/utils/types/user"

const API_URL = `${API_BASE_URL}/admin/users`

export function useUserApi() {

    const getUsers = async (): Promise<User[]> => {
    const res = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Erreur lors du chargement des utilisateurs")
    }

    return res.json()
  }


  const createUser = async (payload: Partial<User>) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Erreur lors de la création")
    }

    return res.json()
  }

  const updateUser = async (id: string, payload: Partial<User>) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Erreur lors de la mise à jour")
    }

    return res.json()
  }

  const deleteUser = async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Erreur lors de la suppression")
    }

    return true
  }

  return {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}
