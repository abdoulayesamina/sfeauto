// "use client"

// import { useEffect, useRef, useState } from "react"

// const API_URL = process.env.NEXT_PUBLIC_API_URL + "/invoices"

// export type InvoicePhoto = {
//   id: string
//   blobName: string
//   url: string
//   sasUrl: string
//   contentType?: string | null
//   size?: number | null
//   createdAt: string
// }

// export function useInvoicePhotos(invoiceId?: string) {
//   const [photos, setPhotos] = useState<InvoicePhoto[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const abortRef = useRef<AbortController | null>(null)

//   useEffect(() => {
//     // ✅ reset immédiat quand on change d’intervention
//     setPhotos([])
//     setError(null)

//     if (!invoiceId || invoiceId === "undefined" || invoiceId === "null") {
//       setLoading(false)
//       return
//     }

//     // ✅ annule la requête précédente si elle existe
//     abortRef.current?.abort()
//     const controller = new AbortController()
//     abortRef.current = controller

//     const run = async () => {
//       setLoading(true)
//       try {
//         const res = await fetch(`${API_URL}/${invoiceId}/photos`, {
//           method: "GET",
//           cache: "no-store",
//           signal: controller.signal,
//         })
//         const data = await res.json()
//         if (!res.ok) throw new Error(data?.error || "Erreur chargement photos")

//         setPhotos(data?.photos || [])
//       } catch (e: any) {
//         // Si abort -> on ignore
//         if (e?.name === "AbortError") return
//         setPhotos([])
//         setError(e?.message || "Erreur inconnue")
//       } finally {
//         // Ne pas écraser loading si abort
//         if (!controller.signal.aborted) setLoading(false)
//       }
//     }

//     run()

//     return () => {
//       controller.abort()
//     }
//   }, [invoiceId])

//   return { photos, loading, error }
// }

"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/invoices"

export type InvoicePhoto = {
  id: string
  blobName: string
  url: string
  sasUrl: string
  contentType?: string | null
  size?: number | null
  createdAt: string
}


export function useInvoicePhotos(invoiceId?: string) {
  const [photos, setPhotos] = useState<InvoicePhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = async () => {
    if (!invoiceId) return

    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/photos`,
        { cache: "no-store" }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error)

      setPhotos(data.photos || [])
    } catch (e: any) {
      setError(e?.message || "Erreur chargement photos")
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [invoiceId])

  return { photos, loading, error, refetch: fetchPhotos }
}


// export function useInvoicePhotos(invoiceId?: string) {
//   const [photos, setPhotos] = useState<InvoicePhoto[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const abortRef = useRef<AbortController | null>(null)

//   const fetchPhotos = useCallback(async () => {
//     if (!invoiceId || invoiceId === "undefined" || invoiceId === "null") {
//       setPhotos([])
//       setLoading(false)
//       return
//     }

//     abortRef.current?.abort()
//     const controller = new AbortController()
//     abortRef.current = controller

//     setLoading(true)
//     setError(null)

//     try {
//       const res = await fetch(`${API_URL}/${invoiceId}/photos`, {
//         method: "GET",
//         cache: "no-store",
//         signal: controller.signal,
//       })

//       const data = await res.json()
//       if (!res.ok) throw new Error(data?.error || "Erreur chargement photos")

//       setPhotos(data?.photos || [])
//     } catch (e: any) {
//       if (e?.name === "AbortError") return
//       setPhotos([])
//       setError(e?.message || "Erreur inconnue")
//     } finally {
//       if (!controller.signal.aborted) setLoading(false)
//     }
//   }, [invoiceId])

//   useEffect(() => {
//     setPhotos([])
//     setError(null)
//     fetchPhotos()

//     return () => {
//       abortRef.current?.abort()
//     }
//   }, [fetchPhotos])

//   return {
//     photos,
//     loading,
//     error,
//     refetch: fetchPhotos,   
//   }
// }
