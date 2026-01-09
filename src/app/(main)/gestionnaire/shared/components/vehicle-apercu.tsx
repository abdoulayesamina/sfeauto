import { Button } from "@/src/shared/components/ui/button"
import { Car, User, MapPin, Calendar, Wrench, CheckCircle2, PlusCircle } from "lucide-react"

type VehiclePreviewProps = {
  licensePlate: string
  brand: string
  model: string
  year: number
  client: string
  agence: string
  entreeDate: string
  enReparation: number
  termine: number
  onNewIntervention: () => void
}

export function VehiclePreview({
  licensePlate,
  brand,
  model,
  year,
  client,
  agence,
  entreeDate,
  enReparation,
  termine,
  onNewIntervention,
}: VehiclePreviewProps) {
  return (
    <div className="rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-5 shadow-sm flex flex-col gap-4">

      {/* En-tête véhicule */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
          <Car size={22} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-zinc-800">{licensePlate}</span>
          <span className="text-sm text-zinc-500">{brand} {model} • {year}</span>
        </div>
      </div>

      {/* Infos client / agence / date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <User className="text-zinc-400" size={18} />
          <div>
            <p className="text-xs text-zinc-400">Client</p>
            <p className="font-medium text-zinc-700">{client}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-4">
          <MapPin className="text-zinc-400" size={18} />
          <div>
            <p className="text-xs text-zinc-400">Agence</p>
            <p className="font-medium text-zinc-700">{agence}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Calendar className="text-zinc-400" size={18} />
          <div>
            <p className="text-xs text-zinc-400">Date d’entrée</p>
            <p className="font-medium text-zinc-700">{entreeDate}</p>
          </div>
        </div>
      </div>

      {/* Statuts */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3">
          <Wrench className="text-yellow-600" />
          <div>
            <p className="text-xs text-yellow-700">En réparation</p>
            <p className="text-xl font-bold text-yellow-800">{enReparation}</p>
          </div>
        </div>

        <div className="flex-1 rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-600" />
          <div>
            <p className="text-xs text-green-700">Terminé</p>
            <p className="text-xl font-bold text-green-800">{termine}</p>
          </div>
        </div>
      </div>

      {/* Bouton nouvelle intervention */}
      <div className="flex justify-center pt-2">
        <Button className="flex items-center gap-2" onClick={onNewIntervention}>
          <PlusCircle size={18} />
          Nouvelle intervention
        </Button>
      </div>

    </div>
  )
}
