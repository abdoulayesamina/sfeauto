import { Client } from "@/generated/prisma"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/admin/clients"

export function useClientApi() {
  const getClients = async (): Promise<Client[]> => {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error("Erreur chargement clients")
    return res.json()
  }

  const createClient = async (data: Partial<Client>) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error((await res.json()).error)
    return res.json()
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error((await res.json()).error)
    return res.json()
  }

  const deleteClient = async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error((await res.json()).error)
    return res.json()
  }

  return { getClients, createClient, updateClient, deleteClient }
}
