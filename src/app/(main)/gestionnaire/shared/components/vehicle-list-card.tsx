import { List } from "lucide-react"
import { VehicleListAll } from "./vehicle-list-all"
import { VehicleListByAgence } from "./vehicle-list-by-agence"

type VehicleListCardProps = {
  filterByAllVehicule: boolean
  vehicles: any[]
  clients: any[]
  agences: any[]
  onSelect: (vehicle: any) => void
  reloadVehicles?: () => void
}

export function VehicleListCard({
  filterByAllVehicule,
  vehicles,
  clients,
  agences,
  onSelect,
  reloadVehicles, 
}: VehicleListCardProps) {
  return (
    <div className="mt-6 border p-3 rounded">
      {/* Header */}
      <div className="flex items-center border-b p-2 bg-gray-700 backdrop-blur-xl text-white rounded">
        <div className="flex items-center gap-2 font-bold">
           <h1>Liste des véhicules</h1>
        </div>
      </div>

      {/* Liste véhicules */}
      <div className="max-h-[500px] overflow-auto mb-4">
        {filterByAllVehicule ? (
          <VehicleListAll
            vehicles={vehicles}
            clients={clients}
            agences={agences}
            onSelect={onSelect}
            reloadVehicles={()=> reloadVehicles?.()}
          />
        ) : (
          <VehicleListByAgence
            vehicles={vehicles}
            agences={agences}
            clients={clients}
            onSelect={onSelect}
            reloadVehicles={()=> reloadVehicles?.()}
          />
        )}

      </div>
    </div>
  )
}