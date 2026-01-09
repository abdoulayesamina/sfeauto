import { Client } from "@/src/utils/types/client"

export function useClientApi() {
  const getClients = async (): Promise<Client[]> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/clients`,
      { credentials: "include" } // important si auth par cookie
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur chargement clients")
    }

    return res.json()
  }

  return { getClients }
}
