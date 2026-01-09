import { List } from "lucide-react"
import { VehicleListAll } from "./vehicle-list-all"
import { VehicleListByAgence } from "./vehicle-list-by-agence"

type VehicleListCardProps = {
  filterByAllVehicule: boolean
  vehicles: any[]
  clients: any[]
  agences: any[]
  onSelect: (vehicle: any) => void
}

export function VehicleListCard({
  filterByAllVehicule,
  vehicles,
  clients,
  agences,
  onSelect,
}: VehicleListCardProps) {
  return (
    <div className="mt-6 border p-3 rounded">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <List size={25} />
          <h1>Liste des véhicules</h1>
        </div>
        <div className="flex items-center gap-4 hidden lg:inline">
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <span className="bg-yellow-400 rounded-full w-4 h-4 inline-block"></span>
            <span>En réparation</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <span className="bg-green-400 rounded-full w-4 h-4 inline-block"></span>
            <span>Terminé</span>
          </div>
        </div>
      </div>

      {/* Liste véhicules */}
      <div className="max-h-[500px] overflow-auto mt-4 shadow">
        {filterByAllVehicule ? (
          <VehicleListAll
            vehicles={vehicles}
            clients={clients}
            agences={agences}
            onSelect={onSelect}
          />
        ) : (
          <VehicleListByAgence
            vehicles={vehicles}
            agences={agences}
            clients={clients}
            onSelect={onSelect}
          />
        )}
      </div>
    </div>
  )
}