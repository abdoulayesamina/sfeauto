"use client"

import { Card, CardContent } from "@/src/shared/components/ui/card"
import { Button } from "@/src/shared/components/ui/button"
import { Badge } from "@/src/shared/components/ui/badge"
import { Calendar, Clock, Eye, ChevronLeft, FileText } from "lucide-react"
import { filterByUIStatus, toUIStatus } from "@/src/utils/constants/intervention-status"
import InterventionStatusBadge from "./InterventionStatusBadge"

interface VehicleInterventionsModalProps {
  vehicle: any
  interventions: any[]
  filterStatus: "ALL" | "ATTENTE_REPARATION" | "TERMINEE" | "ATTENTE_PIECES"
  onClose: () => void
  onViewDetails: (intervention: any) => void
}


const displayValue = (v: any) => {
  if (v === null || v === undefined) return "-"
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v)

  if (typeof v === "object") {

    if ("name" in v && v?.name) return String(v.name)
    if ("label" in v && v?.label) return String(v.label)
    if ("title" in v && v?.title) return String(v.title)
    if ("location" in v && v?.location) return displayValue(v.location) 
    return "-" 
  }

  return "-"
}

export default function VehicleInterventionsModal({
  vehicle,
  interventions,
  filterStatus,
  onClose,
  onViewDetails,
}: VehicleInterventionsModalProps) {
  const filteredInterventions = filterByUIStatus(interventions, filterStatus)

  const stats = {
    total: interventions.length,
    enCours: interventions.filter((i) => toUIStatus(i.status) === "ATTENTE_REPARATION").length,
    attentePieces: interventions.filter((i) => toUIStatus(i.status) === "ATTENTE_PIECES").length,
    terminee: interventions.filter((i) => toUIStatus(i.status) === "TERMINEE").length,
  }

  // Affichage sécurisé des champs véhicule
  const plate = displayValue(vehicle?.licensePlate)
  const brand = displayValue(vehicle?.brand)
  const model = displayValue(vehicle?.model)
  const year = displayValue(vehicle?.year)

  const agenceLocation = displayValue(vehicle?.base?.location)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header modal */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft size={16} />
                Retour
              </Button>

              <h2 className="text-2xl font-bold text-gray-900">Interventions du véhicule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-semibold block">Plaque :</span>
                <span className="text-base font-medium">{plate}</span>
              </div>

              <div>
                <span className="font-semibold block">Marque/Modèle :</span>
                <span className="text-base font-medium">
                  {brand} {model}
                </span>
              </div>

              <div>
                <span className="font-semibold block">Année :</span>
                <span className="text-base font-medium">{year}</span>
              </div>

              <div>
                <span className="font-semibold block">Agence :</span>
                <span className="text-base font-medium">{agenceLocation}</span>
              </div>
            </div>

            {/* Stats des interventions */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-sm">
                <FileText size={12} className="mr-1" />
                Total: {stats.total}
              </Badge>

              {stats.enCours > 0 && (
                <Badge variant="secondary" className="text-sm">
                  En cours: {stats.enCours}
                </Badge>
              )}

              {stats.attentePieces > 0 && (
                <Badge
                  variant="secondary"
                  className="text-sm bg-amber-100 text-amber-800 hover:bg-amber-100"
                >
                  Attente pièces: {stats.attentePieces}
                </Badge>
              )}

              {stats.terminee > 0 && (
                <Badge
                  variant="secondary"
                  className="text-sm bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Terminées: {stats.terminee}
                </Badge>
              )}
            </div>
          </div>

          <Badge variant="secondary" className="text-sm h-fit">
            {filteredInterventions.length} intervention
            {filteredInterventions.length > 1 ? "s" : ""} filtrée
            {filteredInterventions.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Liste des interventions du véhicule */}
      <div className="p-6">
        {filteredInterventions.length > 0 ? (
          <div className="space-y-4">
            {filteredInterventions.map((intervention) => (
              <Card
                key={intervention.id}
                className="border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header intervention */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          Intervention #{String(intervention.id).slice(-8)}
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
                          {intervention.accordNumber && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Accord :</span>{" "}
                              {displayValue(intervention.accordNumber)}
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Début :{" "}
                            {intervention.createdAt
                              ? new Date(intervention.createdAt).toLocaleDateString("fr-FR")
                              : "-"}
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            Mis à jour :{" "}
                            {(intervention.statusUpdatedAt || intervention.createdAt)
                              ? new Date(intervention.statusUpdatedAt || intervention.createdAt).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "-"}
                          </div>
                        </div>
                      </div>

                      <div className="lg:ml-4">
                        <InterventionStatusBadge status={intervention.status} />
                      </div>
                    </div>

                    {/* Description */}
                    {intervention.workDescription && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Description des travaux</h4>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed line-clamp-2">
                          {displayValue(intervention.workDescription)}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune intervention ne correspond au filtre sélectionné</p>
          </div>
        )}
      </div>
    </div>
  )
}
