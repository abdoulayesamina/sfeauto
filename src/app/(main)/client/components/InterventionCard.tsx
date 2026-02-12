import { Card, CardContent } from "@/src/shared/components/ui/card"
import { Button } from "@/src/shared/components/ui/button"
import { Badge } from "@/src/shared/components/ui/badge"
import { Car, Calendar, Eye, ChevronRight } from "lucide-react"
import { getStatusMeta, toUIStatus } from "@/src/utils/constants/intervention-status"
import InterventionStatusBadge from "./InterventionStatusBadge"

interface InterventionCardProps {
  intervention: any
  onViewInterventions: () => void
  onViewDetails: () => void
}

// Fonction de débogage pour voir les statuts réels
const debugStatus = (backendStatus: string) => {
  console.log("Statut backend:", backendStatus)
  const uiStatus = toUIStatus(backendStatus)
  console.log("Statut UI:", uiStatus)
  return uiStatus
}

export default function InterventionCard({
  intervention,
  onViewInterventions,
  onViewDetails,
}: InterventionCardProps) {
  // Ajout d'un log pour déboguer
  // console.log("Intervention complète:", {
  //   id: intervention.id,
  //   status: intervention.status,
  //   accordNumber: intervention.accordNumber
  // })

  const status = toUIStatus(intervention.status)
  // OU utilisez la fonction de débogage :
  // const status = debugStatus(intervention.status)
  
  const statusMeta = getStatusMeta(status)
  const StatusIcon = statusMeta.icon

  // Si le statut montre "En attente de réparation" mais devrait être "Terminée"
  // vérifiez directement le statut backend
  const isFinished = intervention.status === "FIXING_FINISHED"
  const isTerminee = status === "TERMINEE"

  return (
    <Card 
      className="group overflow-hidden border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-2xl cursor-pointer"
      onClick={onViewInterventions}
    >
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Informations véhicule - 4 colonnes */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                <Car size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-lg truncate">{intervention.vehicle.licensePlate}</p>
                  <Badge variant="outline" className="text-xs">
                    {intervention.vehicle.brand}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {intervention.vehicle.model} • {intervention.vehicle.year}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {intervention.vehicle.color}
                </p>
              </div>
            </div>
          </div>

          {/* Informations intervention - 3 colonnes */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 text-gray-600 flex-shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Début d'intervention</p>
                <p className="text-sm text-gray-500">
                  {new Date(intervention.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
                {intervention.accordNumber && (
                  <p className="text-xs text-gray-400 mt-1">
                    Accord : {intervention.accordNumber}
                  </p>
                )}
                
              </div>
            </div>
          </div>

          {/* Statut - 2 colonnes */}
          <div className="lg:col-span-2">
            {/* Solution temporaire si toUIStatus ne fonctionne pas */}
            {intervention.status === "FIXING_FINISHED" ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-green-100 text-green-700 border-green-200 w-fit">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-medium">Terminée</span>
              </div>
            ) : (
              <InterventionStatusBadge status={status} showIcon />
            )}
          </div>

          {/* Actions - 3 colonnes */}
          <div className="lg:col-span-3 flex justify-end">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2 rounded-lg border-gray-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewInterventions()
                }}
              >
                <Eye size={16} />
                Voir véhicule
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
             
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}