"use client"

import { Button } from "@/src/shared/components/ui/button"
import { toUIStatus } from "@/src/utils/constants/intervention-status"
import { useEffect, useState } from "react"
import { getBrandNameById, getModelNameById } from "../../brands/shared/hooks/GetBrandOrModelName"

type UIStatus = "CONFIRMEE" | "EN_COURS" | "ATTENTE_PIECES" | "TERMINEE"

type Props = {
  intervention: any
  onViewInterventions: () => void
  onViewDetails: () => void
  hideVehicleActions?: boolean
  hideDetailsButton?: boolean
  userBaseId?: string | null
}

function computeCounts(intervention: any) {
  if (intervention?.counts) {
    return {
      CONFIRMEE: Number(intervention.counts.CONFIRMEE ?? 0),
      EN_COURS: Number(intervention.counts.EN_COURS ?? 0),
      ATTENTE_PIECES: Number(intervention.counts.ATTENTE_PIECES ?? 0),
      TERMINEE: Number(intervention.counts.TERMINEE ?? 0),
    }
  }

  const interventions = Array.isArray(intervention?.vehicle?.interventions) ? intervention.vehicle.interventions : []

  let confirmee = 0,
    enCours = 0,
    attentePieces = 0,
    terminee = 0

  for (const inv of interventions) {
    const ui = toUIStatus(inv.status)
    if (ui === "CONFIRMEE") confirmee++
    else if (ui === "EN_COURS") enCours++
    else if (ui === "ATTENTE_PIECES") attentePieces++
    else if (ui === "TERMINEE") terminee++
  }

  return { CONFIRMEE: confirmee, EN_COURS: enCours, ATTENTE_PIECES: attentePieces, TERMINEE: terminee }
}

function Badge({ label, variant }: { label: string; variant: "blue" | "orange" | "green" }) {
  const cls =
    variant === "blue"
      ? "bg-blue-100 text-blue-700"
      : variant === "orange"
        ? "bg-orange-100 text-orange-700"
        : "bg-emerald-100 text-emerald-700"

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{label}</span>
}

const displayValue = (v: any) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);

  if (typeof v === "object") {
    if ("name" in v && v?.name) return String(v.name);
    if ("label" in v && v?.label) return String(v.label);
    if ("title" in v && v?.title) return String(v.title);
    if ("location" in v && v?.location) return displayValue(v.location);
    return "—";
  }

  return "—";
};

export default function InterventionCard({
  intervention,
  onViewInterventions,
  onViewDetails,
  hideVehicleActions,
  hideDetailsButton,
  userBaseId,
}: Props) {
  const v = intervention?.vehicle ?? {}
  const counts = computeCounts(intervention)

  // Véhicule transféré : côté client via isTransferred, côté agence via currentBaseId vs userBaseId
  const isTransferred = v?.isTransferred || (userBaseId != null && v?.currentBaseId != null && v.currentBaseId !== userBaseId)

  const totalInterventions =
    counts.CONFIRMEE + counts.EN_COURS + counts.ATTENTE_PIECES + counts.TERMINEE

  return (
    <div
      // onClick={onViewDetails}
      className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition
      hover:border-[#F5963A]"
      // role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onViewDetails()
        }
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900 truncate">{displayValue(v?.licensePlate)}</h3>
            {<p className="text-gray-500 text-sm truncate">{displayValue(v?.brand)} {displayValue(v?.model)}</p>}
            {v?.year != null && <p className="text-gray-400 text-sm">· {displayValue(v.year)}</p>}
            {isTransferred && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                Véhicule transféré
              </span>
            )}
          </div>

          <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-2">
            <span>{displayValue(v?.client)}</span>
            <span>•</span>
            <span>{displayValue(v?.base?.location)}</span>
            {v?.entryDate && (
              <>
                <span>•</span>
                <span>Entrée : {new Date(v.entryDate).toLocaleDateString("fr-FR")}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {counts.CONFIRMEE > 0 && (
              <Badge variant="blue" label={`${counts.CONFIRMEE} Confirmée`} />
            )}
            {counts.EN_COURS > 0 && (
              <Badge variant="blue" label={`${counts.EN_COURS} En cours`} />
            )}
            {counts.ATTENTE_PIECES > 0 && (
              <Badge variant="orange" label={`${counts.ATTENTE_PIECES} En attente de pièces`} />
            )}
            {counts.TERMINEE > 0 && <Badge variant="green" label={`${counts.TERMINEE} Terminée`} />}
            {totalInterventions === 0 && <span className="text-sm text-gray-400 italic">Aucune intervention</span>}
          </div>
        </div>

        {!hideVehicleActions && (
          <div className="flex items-center gap-2 justify-end">
            {hideDetailsButton && (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails()
                }}
              >
                Voir détail complet
              </Button>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onViewInterventions()
              }}
            >
              Voir interventions
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}