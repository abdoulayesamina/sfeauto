"use client"

import React from "react"
import { Car, User, MapPin, Wrench, FileText, Calendar } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import { toUIStatus, getStatusMeta, HISTORY_LABELS } from "@/src/utils/constants/intervention-status"

type UIStatus = "EN_COURS" | "ATTENTE_PIECES" | "TERMINEE"

type Props = {
  selectedIntervention: any
  onClose: () => void
}

export default function IntervDetailGes({ selectedIntervention, onClose }: Props) {
  if (!selectedIntervention) return null

  const uiStatus: UIStatus = toUIStatus(selectedIntervention?.status)
  const history = selectedIntervention?.statusHistory ?? []

  return (
    <div className="space-y-6 md:w-[600px]">

      {/* Header */}
      <div className="border-b bg-black/90 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold">
          Intervention – {selectedIntervention?.vehicle?.licensePlate || selectedIntervention?.licensePlate}
        </h2>
        <p className="text-sm text-gray-400">
          Accord N° {selectedIntervention?.accordNumber || "-"}
        </p>
      </div>

      {/* VEHICULE INFO */}
      <div className="rounded-xl border p-4 bg-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
            <Car />
          </div>
          <p className="font-semibold">Véhicule</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <p><span className="font-medium">Immatriculation :</span> {selectedIntervention?.vehicle?.licensePlate}</p>
          <p><span className="font-medium">Modèle :</span> {selectedIntervention?.vehicle?.brand} {selectedIntervention?.vehicle?.model}</p>
          <p><span className="font-medium">Année :</span> {selectedIntervention?.vehicle?.year}</p>
          <p><span className="font-medium">Couleur :</span> {selectedIntervention?.vehicle?.color}</p>
          <p><span className="font-medium">Date d’entrée :</span> {selectedIntervention?.vehicle?.entryDate ? new Date(selectedIntervention.vehicle.entryDate).toLocaleDateString("fr-FR") : "-"}</p>
        </div>
      </div>

      {/* CLIENT & BASE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <User />
          </div>
          <div>
            <p className="font-semibold">{selectedIntervention?.vehicle?.client?.name}</p>
            <p className="text-sm text-gray-500">Client</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <MapPin />
          </div>
          <div>
            <p className="font-semibold">{selectedIntervention?.vehicle?.base?.location}</p>
            <p className="text-sm text-gray-500">Base</p>
          </div>
        </div>
      </div>

      {/* ACCORD & STATUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4 bg-zinc-50">
          <div className="mb-1 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
              <Wrench />
            </div>
            <p className="font-semibold">Accord client</p>
          </div>
          <p className="text-sm">{selectedIntervention?.accordNumber || "-"}</p>
          <p className="text-xs text-gray-500 mt-1">
            Confirmé le {selectedIntervention?.dateOfConfirmation ? new Date(selectedIntervention.dateOfConfirmation).toLocaleDateString("fr-FR") : "-"}
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${getStatusMeta(uiStatus).bg}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-lg bg-white ${getStatusMeta(uiStatus).color}`}>
              {React.createElement(getStatusMeta(uiStatus).icon, { size: 20 })}
            </div>
            <p className="text-sm text-gray-500">Statut actuel</p>
          </div>
          <p className={`text-lg font-semibold ${getStatusMeta(uiStatus).color}`}>
            {getStatusMeta(uiStatus).label}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Mis à jour le {selectedIntervention?.statusUpdatedAt ? new Date(selectedIntervention.statusUpdatedAt).toLocaleString("fr-FR") : "-"}
          </p>
        </div>
      </div>

      {/* DESCRIPTION TRAVAIL */}
      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2 flex items-center gap-2"><FileText /> Description du travail</p>
        <p className="text-gray-600 text-sm">{selectedIntervention?.workDescription || "Aucune description fournie"}</p>
      </div>

      {/* DETAILS COMPLEMENTAIRES */}
      <div className="rounded-xl border p-4 bg-zinc-50 space-y-2">
        <p className="font-semibold mb-2">Détails complémentaires</p>
        <p><span className="font-medium">Pièces commandées :</span> {selectedIntervention?.didOrderParts ? "Oui" : "Non"}</p>
        <p><span className="font-medium">Commentaires :</span> {selectedIntervention?.comments || "-"}</p>
        {selectedIntervention?.ordersDetails && (
          <p><span className="font-medium">Détails de commande :</span> {selectedIntervention.ordersDetails}</p>
        )}
        <p><span className="font-medium">Géré par :</span> {selectedIntervention?.handledBy?.name} ({selectedIntervention?.handledBy?.email})</p>
        <p><span className="font-medium">Créé le :</span> {selectedIntervention?.createdAt ? new Date(selectedIntervention.createdAt).toLocaleDateString("fr-FR") : "-"}</p>
        <p><span className="font-medium">Mis à jour le :</span> {selectedIntervention?.updatedAt ? new Date(selectedIntervention.updatedAt).toLocaleDateString("fr-FR") : "-"}</p>
      </div>

      {/* HISTORIQUE STATUT */}
      {history.length > 0 && (
        <div className="rounded-xl border p-4 bg-zinc-50">
          <p className="font-semibold mb-2">Historique des statuts</p>
          <div className="space-y-4">
            {history.map((h: any) => (
              <div key={h.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                  {h !== history[history.length - 1] && <div className="flex-1 w-px bg-gray-300" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium">
                    {HISTORY_LABELS[h.previousStatus] ?? h.previousStatus} → <span className="text-blue-600">{HISTORY_LABELS[h.newStatus] ?? h.newStatus}</span>
                  </p>
                  <p className="text-xs text-gray-500">{new Date(h.changedAt).toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-gray-500">Modifié par <span className="font-medium">{h.changedBy?.name || "Système"}</span></p>
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
