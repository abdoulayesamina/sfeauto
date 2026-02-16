"use client"

import { Button } from "@/src/shared/components/ui/button"
import { toUIStatus } from "@/src/utils/constants/intervention-status"
import { useEffect, useState } from "react"
import { getBrandNameById, getModelNameById } from "../../brands/shared/hooks/GetBrandOrModelName"

type UIStatus = "ATTENTE_REPARATION" | "ATTENTE_PIECES" | "TERMINEE"

type Props = {
  intervention: any
  onViewInterventions: () => void
  onViewDetails: () => void
  hideVehicleActions?: boolean
  hideDetailsButton?: boolean
}

function computeCounts(intervention: any) {
  if (intervention?.counts) {
    return {
      ATTENTE_REPARATION: Number(intervention.counts.ATTENTE_REPARATION ?? 0),
      ATTENTE_PIECES: Number(intervention.counts.ATTENTE_PIECES ?? 0),
      TERMINEE: Number(intervention.counts.TERMINEE ?? 0),
    }
  }

  const invoices = Array.isArray(intervention?.vehicle?.invoices) ? intervention.vehicle.invoices : []

  let ar = 0,
    ap = 0,
    t = 0

  for (const inv of invoices) {
    const ui = toUIStatus(inv.status)
    if (ui === "ATTENTE_REPARATION") ar++
    else if (ui === "ATTENTE_PIECES") ap++
    else if (ui === "TERMINEE") t++
  }

  return { ATTENTE_REPARATION: ar, ATTENTE_PIECES: ap, TERMINEE: t }
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

export default function InterventionCard({
  intervention,
  onViewInterventions,
  onViewDetails,
  hideVehicleActions,
  hideDetailsButton,
}: Props) {  
  const v = intervention?.vehicle ?? {}
  const counts = computeCounts(intervention)

  const totalInterventions =
  counts.ATTENTE_REPARATION + counts.ATTENTE_PIECES + counts.TERMINEE

  // affichage fallback si jamais brand/model null
  const [brandModel,setBrandModel] = useState("");

  useEffect(() => {    
    if (!v?.brandId && !v?.modelId) {
      setBrandModel(""); 
      return;
    }

    const getNames = async () => {
      try {
        const brandName = v.brandId ? await getBrandNameById(v.brandId) : "";
        const modelName = v.modelId ? await getModelNameById(v.modelId) : "";
        setBrandModel(`${brandName} ${modelName}`.trim());
      } catch (err) {
        setBrandModel("..."); 
      }
    };

    getNames();
    
  }, [v.brandId, v.modelId]);

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900 truncate">{v?.licensePlate || "—"}</h3>
            {brandModel && <p className="text-gray-500 text-sm truncate">{brandModel}</p>}
            {v?.year != null && <p className="text-gray-400 text-sm">· {v.year}</p>}
          </div>

          <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-2">
            <span>{v?.client?.name || "—"}</span>
            <span>•</span>
            <span>{v?.base?.location || "—"}</span>
            {v?.entryDate && (
              <>
                <span>•</span>
                <span>Entrée : {new Date(v.entryDate).toLocaleDateString("fr-FR")}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {counts.ATTENTE_REPARATION > 0 && (
              <Badge variant="blue" label={`${counts.ATTENTE_REPARATION} En attente de réparation`} />
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
            {!hideDetailsButton && (
              <Button variant="outline" onClick={onViewDetails}>
                Voir détail complet
              </Button>
            )}
            <Button onClick={onViewInterventions}>Voir interventions</Button>
          </div>
        )}
      </div>
    </div>
  )
}
