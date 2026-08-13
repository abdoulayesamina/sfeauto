"use client"

import React, { useEffect, useState } from "react"
import { Car, User, MapPin, Wrench, FileText, Images, X, CheckCircle } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import {
  getStatusMeta,
  HISTORY_LABELS,
  UIStatus,
  computeUIStatus,
} from "@/src/utils/constants/intervention-status"
import { errorAlert } from "@/src/lib/alerts"
import { useInterventionPhotos } from "../hooks/useInterventionPhotos.api"

type Props = {
  selectedIntervention: any
  onClose: () => void
}

export default function IntervDetailGes({ selectedIntervention, onClose }: Props) {
  if (!selectedIntervention) return null

  const uiStatus: UIStatus = computeUIStatus({ int_status: selectedIntervention?.int_status })

  // Client/agence au moment de l'intervention (capturés à la création) vs
  // client/agence actuels du véhicule — mêmes fallback et comparaison que
  // vehicle-apercu.tsx.
  const currentClient = selectedIntervention?.int_vehicle?.veh_client?.cli_name
  const currentAgence = selectedIntervention?.int_vehicle?.veh_base?.bas_location
  const historicalClient = selectedIntervention?.int_client?.cli_name ?? currentClient
  const historicalAgence = selectedIntervention?.int_base?.bas_location ?? currentAgence
  const isHistorical =
    (selectedIntervention?.int_client?.cli_name && selectedIntervention.int_client.cli_name !== currentClient) ||
    (selectedIntervention?.int_base?.bas_location && selectedIntervention.int_base.bas_location !== currentAgence)

  const history = selectedIntervention?.int_statusHistory ?? []

  const {
    photos,
    loading: photosLoading,
    error: photosError,
  } = useInterventionPhotos(selectedIntervention?.int_id)

  // Lightbox
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

  return (
    <div className="space-y-6 md:w-[600px]">
      {/* Header */}
      <div className="border-b bg-black/90 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold">
          Intervention –{" "}
          {selectedIntervention?.int_vehicle?.veh_licensePlate ||
            selectedIntervention?.int_licensePlate}
        </h2>
        <p className="text-sm text-gray-400">
          Accord N° {selectedIntervention?.int_accordNumber || "-"}
        </p>
      </div>

      <div className="rounded-xl border p-4 bg-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
            <Car />
          </div>
          <p className="font-semibold">Véhicule</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="font-medium">Immatriculation :</span>{" "}
            {selectedIntervention?.int_vehicle?.veh_licensePlate}
          </p>
          <p>
            <span className="font-medium">Modèle :</span>{" "}
            {selectedIntervention?.int_vehicle?.veh_brand}{" "}
            {selectedIntervention?.int_vehicle?.veh_model}
          </p>
          <p>
            <span className="font-medium">Année :</span>{" "}
            {selectedIntervention?.int_vehicle?.veh_year}
          </p>
          <p>
            <span className="font-medium">Couleur :</span>{" "}
            {selectedIntervention?.int_vehicle?.veh_color}
          </p>
          <p>
            <span className="font-medium">Date d’entrée :</span>{" "}
            {selectedIntervention?.int_vehicle?.veh_entryDate
              ? new Date(
                selectedIntervention.int_vehicle.veh_entryDate
              ).toLocaleDateString("fr-FR")
              : "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`flex items-center gap-4 rounded-xl border p-4 ${
            isHistorical ? "bg-amber-50 border-amber-300" : ""
          }`}
          title={isHistorical ? "Ce client a changé depuis cette intervention" : undefined}
        >
          <div className={`p-2 rounded-lg ${isHistorical ? "bg-amber-200 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
            <User />
          </div>
          <div>
            <p className="font-semibold">{historicalClient}</p>
            <p className={`text-sm ${isHistorical ? "text-amber-700 font-medium" : "text-gray-500"}`}>
              Client{isHistorical ? " (historique)" : ""}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-4 rounded-xl border p-4 ${
            isHistorical ? "bg-amber-50 border-amber-300" : ""
          }`}
          title={isHistorical ? "Cette agence a changé depuis cette intervention" : undefined}
        >
          <div className={`p-2 rounded-lg ${isHistorical ? "bg-amber-200 text-amber-800" : "bg-purple-100 text-purple-700"}`}>
            <MapPin />
          </div>
          <div>
            <p className="font-semibold">{historicalAgence}</p>
            <p className={`text-sm ${isHistorical ? "text-amber-700 font-medium" : "text-gray-500"}`}>
              Base{isHistorical ? " (historique)" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`rounded-xl border p-4 ${selectedIntervention?.int_accordNumber !== 'REFUSE' ? 'bg-zinc-50' : 'bg-red-100'}`}>
          <div className="mb-1 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
              <CheckCircle />
            </div>
            <p className="font-semibold">Accord client</p>
          </div>
          <p className="text-sm">{selectedIntervention?.int_accordNumber || "-"}</p>
          <p className="text-xs text-gray-500 mt-1">
            Confirmé le{" "}
            {selectedIntervention?.int_dateOfConfirmation
              ? new Date(
                selectedIntervention.int_dateOfConfirmation
              ).toLocaleDateString("fr-FR")
              : "-"}
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${getStatusMeta(uiStatus).bg}`}>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={`p-2 rounded-lg bg-white ${getStatusMeta(uiStatus).color}`}
            >
              {React.createElement(getStatusMeta(uiStatus).icon, { size: 20 })}
            </div>
            <p className="text-sm text-gray-500">Statut actuel</p>
          </div>
          <p className={`text-lg font-semibold ${getStatusMeta(uiStatus).color}`}>
            {getStatusMeta(uiStatus).label}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Mis à jour le{" "}
            {selectedIntervention?.int_statusUpdatedAt
              ?(new Date( selectedIntervention.int_statusUpdatedAt).toLocaleDateString("fr-FR") +" à "+ new Date( selectedIntervention.int_statusUpdatedAt).toLocaleTimeString("fr-FR"))
              : "-"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2 flex items-center gap-2">
          <FileText /> Description du travail
        </p>
        <p className="text-gray-600 text-sm">
          {selectedIntervention?.int_workDescription || "Aucune description fournie"}
        </p>
      </div>

      {/* Commentaires */}
      <div className="rounded-xl border-[4px] border-red-300 p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Commentaires</p>
        <p className="text-gray-600 text-sm">
            {selectedIntervention?.int_comments || "Aucun commentaire fourni"}
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

      <div className="rounded-xl border p-4 bg-zinc-50 space-y-2">
        <p className="font-semibold mb-2">Détails complémentaires</p>
        <p>
          <span className="font-medium">Pièces commandées :</span>{" "}
          {selectedIntervention?.int_didOrderParts ? "Oui" : "Non"}
        </p>
        <p>
          <span className="font-medium">Commentaires :</span>{" "}
          {selectedIntervention?.int_comments || "-"}
        </p>
        {selectedIntervention?.int_ordersDetails && (
          <p>
            <span className="font-medium">Détails de commande :</span>{" "}
            {selectedIntervention.int_ordersDetails}
          </p>
        )}
        <p>
          <span className="font-medium">Géré par :</span>{" "}
          {selectedIntervention?.int_handledBy?.usr_name} (
          {selectedIntervention?.int_handledBy?.usr_email})
        </p>
        <p>
          <span className="font-medium">Créé le :</span>{" "}
          {selectedIntervention?.int_createdAt
            ? new Date(selectedIntervention.int_createdAt).toLocaleDateString("fr-FR")
            : "-"}
        </p>
        <p>
          <span className="font-medium">Mis à jour le :</span>{" "}
          {selectedIntervention?.int_updatedAt
            ? new Date(selectedIntervention.int_updatedAt).toLocaleDateString("fr-FR")
            : "-"}
        </p>
      </div>

      {history.length > 0 && (
        <div className="rounded-xl border p-4 bg-zinc-50">
          <p className="font-semibold mb-2">Historique des statuts</p>
          <div className="space-y-4">
            {history.map((h: any) => (
              <div key={h.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                  {h !== history[history.length - 1] && (
                    <div className="flex-1 w-px bg-gray-300" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium">
                    {HISTORY_LABELS[h.previousStatus] ?? h.previousStatus} →{" "}
                    <span className="text-blue-600">
                      {HISTORY_LABELS[h.newStatus] ?? h.newStatus}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {/* {new Date(h.changedAt).toLocaleString("fr-FR")} */}
                    {new Date(h.changedAt).toLocaleDateString("fr-FR")+" à "+new Date(h.changedAt).toLocaleTimeString("fr-FR")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Modifié par{" "}
                    <span className="font-medium">
                      {h.changedBy?.name || "Système"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onClose} className="w-full p-4">
        Fermer
      </Button>
    </div>
  )
}
