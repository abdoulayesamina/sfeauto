"use client"

import React from "react"
import { Car, User, MapPin, Wrench } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"

type Invoice = {
  id: string
  status: string
  invoiceConfirmed: boolean
  workDescription: string
  accordNumber: string
  dateOfConfirmation: string
  createdAt: string
}

type Vehicle = {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
  client: { id: string; name: string }
  base: { id: string; location: string; clientId: string }
  invoices: Invoice[]
  createdAt: string
  updatedAt: string
  handledBy?: { name: string; email?: string }
}

type Props = {
  selectedVehicle: Vehicle
  onClose: () => void
}

// --- mapping pour les statuts ---
const STATUS_UI_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CONFIRMED_IN_PLANNING: { label: "EN COURS", color: "text-blue-600", bg: "bg-blue-100", icon: Car },
  FIXING_STARTED: { label: "EN COURS", color: "text-blue-600", bg: "bg-blue-100", icon: Car },
  WAITING_FOR_PARTS: { label: "ATTENTE PIECES", color: "text-orange-600", bg: "bg-orange-100", icon: Wrench },
  FIXING_FINISHED: { label: "TERMINEE", color: "text-emerald-600", bg: "bg-emerald-100", icon: Car },
}

export default function InterventionDetailClient({ selectedVehicle, onClose }: Props) {
  if (!selectedVehicle || !selectedVehicle.invoices?.length) return null

  const selectedIntervention = {
    ...selectedVehicle.invoices[0],
    vehicle: {
      licensePlate: selectedVehicle.licensePlate,
      brand: selectedVehicle.brand,
      model: selectedVehicle.model,
      year: selectedVehicle.year,
      color: selectedVehicle.color,
      client: selectedVehicle.client,
      base: selectedVehicle.base,
    },
  }

  const getStatusMeta = (status: string) => STATUS_UI_MAP[status] || { label: status, color: "", bg: "", icon: Car }

  return (
    <div className="space-y-6 md:w-[600px]">

      {/* HEADER */}
      <div className="border-b bg-black/90 rounded-xl p-6 text-white pb-4">
        <h2 className="text-xl font-bold">
          Intervention – {selectedIntervention.vehicle.licensePlate}
        </h2>
        <p className="text-sm text-gray-500">
          Accord N° {selectedIntervention.accordNumber}
        </p>
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
          <p><span className="font-medium">Immatriculation :</span> {selectedIntervention.vehicle.licensePlate}</p>
          <p><span className="font-medium">Modèle :</span> {selectedIntervention.vehicle.brand} {selectedIntervention.vehicle.model}</p>
          <p><span className="font-medium">Année :</span> {selectedIntervention.vehicle.year}</p>
          <p><span className="font-medium">Couleur :</span> {selectedIntervention.vehicle.color}</p>
        </div>
      </div>

      {/* CLIENT & BASE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <User />
          </div>
          <div>
            <p className="font-semibold">{selectedIntervention.vehicle.client.name}</p>
            <p className="text-sm text-gray-500">Client</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <MapPin />
          </div>
          <div>
            <p className="font-semibold">{selectedIntervention.vehicle.base.location}</p>
            <p className="text-sm text-gray-500">Base</p>
          </div>
        </div>
      </div>

      {/* ACCORD & STATUS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Accord client */}
        <div className="rounded-xl border p-4 bg-zinc-50">
          <div className="mb-1 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
              <Wrench />
            </div>
            <p className="font-semibold">Accord client</p>
          </div>

          <p className="text-sm">{selectedIntervention.accordNumber}</p>
          <p className="text-xs text-gray-500 mt-1">
            Confirmé le {new Date(selectedIntervention.dateOfConfirmation).toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* Statut actuel */}
        <div className={`rounded-xl border p-4 ${getStatusMeta(selectedIntervention.status).bg}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-lg bg-white ${getStatusMeta(selectedIntervention.status).color}`}>
              {React.createElement(getStatusMeta(selectedIntervention.status).icon, { size: 20 })}
            </div>
            <p className="text-sm text-gray-500">Statut actuel</p>
          </div>
          <p className={`text-lg font-semibold ${getStatusMeta(selectedIntervention.status).color}`}>
            {getStatusMeta(selectedIntervention.status).label}
          </p>
          <p className="text-xs text-gray-500 mt-1">
  Mis à jour le{" "}
  {selectedIntervention.dateOfConfirmation
    ? new Date(selectedIntervention.dateOfConfirmation).toLocaleDateString("fr-FR")
    : "-"}
</p>

        </div>
      </div>

      {/* Description du travail */}
      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Description du travail</p>
        <p className="text-gray-600 text-sm">{selectedIntervention.workDescription || "Aucune description fournie"}</p>
      </div>

      {/* Informations */}
      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Informations</p>
        <p className="text-sm">
          Créé le {new Date(selectedVehicle.createdAt).toLocaleDateString("fr-FR")}
        </p>
        {selectedVehicle.handledBy && (
          <p className="text-sm mt-1">
            Géré par <span className="font-medium">{selectedVehicle.handledBy.name}</span>{" "}
            <span className="text-gray-500">({selectedVehicle.handledBy.email})</span>
          </p>
        )}
      </div>

      {/* Bouton fermer */}
      <Button onClick={onClose} className="w-full p-8">
        Fermer
      </Button>
    </div>
  )
}
