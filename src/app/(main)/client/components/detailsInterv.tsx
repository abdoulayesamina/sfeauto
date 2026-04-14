"use client"

import React, { useEffect, useState } from "react"
import { Car, User, MapPin, Wrench, Images, X, CheckCircle } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import { errorAlert } from "@/src/lib/alerts"
import { useInterventionPhotos } from "../../gestionnaire/shared/hooks/useInterventionPhotos.api"

type Props = {
  selectedIntervention: any
  onClose: () => void
}

const STATUS_UI_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CONFIRMED_IN_PLANNING: { label: "EN COURS", color: "text-blue-600", bg: "bg-blue-100", icon: Car },
  FIXING_STARTED: { label: "EN COURS", color: "text-blue-600", bg: "bg-blue-100", icon: Car },
  WAITING_FOR_PARTS: { label: "ATTENTE PIECES", color: "text-orange-600", bg: "bg-orange-100", icon: Wrench },
  FIXING_FINISHED: { label: "TERMINEE", color: "text-emerald-600", bg: "bg-emerald-100", icon: Car },
}

const displayValue = (v: any): string => {
  if (v === null || v === undefined) return "-"
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v)

  if (typeof v === "object") {
    if (v?.name) return String(v.name)
    if (v?.label) return String(v.label)
    if (v?.title) return String(v.title)

    // Si on reçoit { location: {...} }
    if (v?.location) return displayValue(v.location)

    return "-"
  }

  return "-"
}

const formatDate = (d: any) => {
  if (!d) return "-"
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return "-"
  return dt.toLocaleDateString("fr-FR")
}

export default function InterventionDetailClient({ selectedIntervention, onClose }: Props) {
  if (!selectedIntervention) return null

  const vehicle = selectedIntervention.vehicle ?? {}

  const {
    photos,
    loading: photosLoading,
    error: photosError,
  } = useInterventionPhotos(selectedIntervention.id)

  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (photosError) errorAlert("Photos", photosError)
  }, [photosError])

  const openViewer = (idx: number) => {
    setActiveIndex(idx)
    setViewerOpen(true)
  }

  const activePhoto = photos?.[activeIndex]?.sasUrl

  const getStatusMeta = (status: string) =>
    STATUS_UI_MAP[status] || { label: status, color: "", bg: "", icon: Car }

  const plate = displayValue(vehicle.licensePlate)
  const brand = displayValue(vehicle.brand)
  const model = displayValue(vehicle.model)
  const year = displayValue(vehicle.year)
  const color = displayValue(vehicle.color)

  const clientName = displayValue(vehicle.client?.name ?? vehicle.client)

  const baseLocation = displayValue(vehicle.base?.location)

  const statusMeta = getStatusMeta(selectedIntervention.status)

  return (
    <div className="space-y-6 md:w-[600px]">
      {/* HEADER */}
      <div className="border-b bg-black/90 rounded-xl p-6 text-white pb-4">
        <h2 className="text-xl font-bold">Intervention – {plate}</h2>
        <p className="text-sm text-gray-500">Accord N° {displayValue(selectedIntervention.accordNumber)}</p>
      </div>

      {/* VEHICULE */}
      <div className="rounded-xl border p-4 bg-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
            <Car />
          </div>
          <p className="font-semibold">Véhicule</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="font-medium">Immatriculation :</span> {plate}
          </p>
          <p>
            <span className="font-medium">Modèle :</span> {brand} {model}
          </p>
          <p>
            <span className="font-medium">Année :</span> {year}
          </p>
          <p>
            <span className="font-medium">Couleur :</span> {color}
          </p>
        </div>
      </div>

      {/* CLIENT & BASE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <User />
          </div>
          <div>
            <p className="font-semibold">{clientName}</p>
            <p className="text-sm text-gray-500">Client</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <MapPin />
          </div>
          <div>
            <p className="font-semibold">{baseLocation}</p>
            <p className="text-sm text-gray-500">Base</p>
          </div>
        </div>
      </div>

      {/* ACCORD & STATUS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Accord client */}
        <div className={`rounded-xl border p-4 ${selectedIntervention?.accordNumber !== 'REFUSE' ? 'bg-zinc-50' : 'bg-red-100'}`}>
          <div className="mb-1 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
              <CheckCircle />
            </div>
            <p className="font-semibold">Accord client</p>
          </div>

          <p className="text-sm">{displayValue(selectedIntervention.accordNumber)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Confirmé le {formatDate(selectedIntervention.dateOfConfirmation)}
          </p>
        </div>

        {/* Statut actuel */}
        <div className={`rounded-xl border p-4 ${statusMeta.bg}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-lg bg-white ${statusMeta.color}`}>
              {React.createElement(statusMeta.icon, { size: 20 })}
            </div>
            <p className="text-sm text-gray-500">Statut actuel</p>
          </div>

          <p className={`text-lg font-semibold ${statusMeta.color}`}>{statusMeta.label}</p>

          <p className="text-xs text-gray-500 mt-1">
            Mis à jour le {formatDate((selectedIntervention as any).statusUpdatedAt || selectedIntervention.createdAt)}
          </p>
        </div>
      </div>

      {/* Description du travail */}
      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Description du travail</p>
        <p className="text-gray-600 text-sm">
          {displayValue(selectedIntervention.workDescription) || "Aucune description fournie"}
        </p>
      </div>

      <div className="rounded-xl border p-4 bg-zinc-50">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold flex items-center gap-2">
            <Images className="w-5 h-5" />
            Photos
          </p>
          <p className="text-xs text-gray-500">
            {photosLoading ? "Chargement..." : `${photos.length} photo(s)`}
          </p>
        </div>

        {photosLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucune photo liée à cette intervention.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((p: any, idx: number) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openViewer(idx)}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-white"
                title="Cliquer pour agrandir"
              >
                <img
                  src={p.sasUrl}
                  alt={`Photo ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Informations</p>
        <p className="text-sm">Créé le {formatDate(selectedIntervention.createdAt)}</p>

        {selectedIntervention.handledBy && (
          <p className="text-sm mt-1">
            Géré par <span className="font-medium">{displayValue(selectedIntervention.handledBy?.name)}</span>{" "}
            <span className="text-gray-500">
              ({displayValue(selectedIntervention.handledBy?.email)})
            </span>
          </p>
        )}
      </div>

      {viewerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              onClick={() => setViewerOpen(false)}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between px-4 py-3 text-white text-sm">
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              >
                ←
              </button>

              <span>
                {activeIndex + 1} / {photos.length}
              </span>

              <button
                type="button"
                className="px-3 py-2 mr-20 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40"
                disabled={activeIndex === photos.length - 1}
                onClick={() =>
                  setActiveIndex((i) => Math.min(photos.length - 1, i + 1))
                }
              >
                →
              </button>
            </div>

            <div className="bg-black flex items-center justify-center">
              <img
                src={activePhoto}
                alt="Photo intervention"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bouton fermer */}
      <Button onClick={onClose} className="w-full p-8">
        Fermer
      </Button>
    </div>
  )
}
