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
  statusUpdatedAt?: string
}

type Vehicle = {
  id: string
  licensePlate: any
  brand: any
  model: any
  year: any
  color: any
  client: any
  base: any
  invoices: Invoice[]
  createdAt: any
  updatedAt: any
  handledBy?: any
}

type Props = {
  selectedVehicle: Vehicle
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

export default function InterventionDetailClient({ selectedVehicle, onClose }: Props) {
  if (!selectedVehicle || !selectedVehicle.invoices?.length) return null

  const firstInvoice = selectedVehicle.invoices[0]

  const selectedIntervention = {
    ...firstInvoice,
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

  const getStatusMeta = (status: string) =>
    STATUS_UI_MAP[status] || { label: status, color: "", bg: "", icon: Car }

  const plate = displayValue(selectedIntervention.vehicle.licensePlate)
  const brand = displayValue(selectedIntervention.vehicle.brand)
  const model = displayValue(selectedIntervention.vehicle.model)
  const year = displayValue(selectedIntervention.vehicle.year)
  const color = displayValue(selectedIntervention.vehicle.color)

  const clientName = displayValue(selectedIntervention.vehicle.client?.name ?? selectedIntervention.vehicle.client)

  const baseLocation = displayValue(selectedIntervention.vehicle.base?.location)

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
        <div className="rounded-xl border p-4 bg-zinc-50">
          <div className="mb-1 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
              <Wrench />
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

      {/* Informations */}
      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Informations</p>
        <p className="text-sm">Créé le {formatDate(selectedVehicle.createdAt)}</p>

        {selectedVehicle.handledBy && (
          <p className="text-sm mt-1">
            Géré par <span className="font-medium">{displayValue(selectedVehicle.handledBy?.name)}</span>{" "}
            <span className="text-gray-500">
              ({displayValue(selectedVehicle.handledBy?.email)})
            </span>
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
