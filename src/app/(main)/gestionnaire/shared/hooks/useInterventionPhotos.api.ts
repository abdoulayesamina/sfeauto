// "use client"

// import { useEffect, useRef, useState } from "react"

// const API_URL = process.env.NEXT_PUBLIC_API_URL + "/interventions"

// export type InterventionPhoto = {
//   id: string
//   blobName: string
//   url: string
//   sasUrl: string
//   contentType?: string | null
//   size?: number | null
//   createdAt: string
// }

// export function useInterventionPhotos(interventionId?: string) {
//   const [photos, setPhotos] = useState<InterventionPhoto[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const abortRef = useRef<AbortController | null>(null)

//   useEffect(() => {
//     // ✅ reset immédiat quand on change d’intervention
//     setPhotos([])
//     setError(null)

//     if (!interventionId || interventionId === "undefined" || interventionId === "null") {
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
//         const res = await fetch(`${API_URL}/${interventionId}/photos`, {
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
//   }, [interventionId])

//   return { photos, loading, error }
// }

"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/interventions"

export type InterventionPhoto = {
  id: string
  blobName: string
  url: string
  sasUrl: string
  contentType?: string | null
  size?: number | null
  createdAt: string
}


export function useInterventionPhotos(interventionId?: string) {
  const [photos, setPhotos] = useState<InterventionPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = async () => {
    if (!interventionId) return

    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interventions/${interventionId}/photos`,
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
  }, [interventionId])

  return { photos, loading, error, refetch: fetchPhotos }
}


// export function useInterventionPhotos(interventionId?: string) {
//   const [photos, setPhotos] = useState<InterventionPhoto[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const abortRef = useRef<AbortController | null>(null)

//   const fetchPhotos = useCallback(async () => {
//     if (!interventionId || interventionId === "undefined" || interventionId === "null") {
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
//       const res = await fetch(`${API_URL}/${interventionId}/photos`, {
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
//   }, [interventionId])

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
