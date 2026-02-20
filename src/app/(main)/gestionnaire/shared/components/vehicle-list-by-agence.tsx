import { VehicleItem } from "./vehicle-Item"

export function VehicleListByAgence({
  vehicles,
  agences,
  clients,
  onSelect,
  reloadVehicles,
}: any) {
  return (
    <>
      {agences.map((agence: any) => {
        const vehiculesAgence = vehicles.filter(
          (v: any) => v.base?.id === agence.id
        )

        return (
          <div key={agence.id} className="mt-8 border rounded">
            <div className="mb-3 flex items-center gap-2 p-2">
              <span className="text-lg font-semibold">
                {agence.location}
              </span>
              <span className="text-sm text-gray-400">
                ({vehiculesAgence.length})
              </span>
            </div>

            {vehiculesAgence.length > 0 ? (
              vehiculesAgence.map((v: any) => (
                <VehicleItem
                  key={v.id}
                  vehicle={v}
                  clients={clients}
                  compact
                  onClick={() => onSelect(v)}
                  reloadVehicles={()=> reloadVehicles?.()}
                />
              ))
            ) : (
              <div className="border border-dashed rounded py-6 text-center text-sm text-gray-400">
                Aucun véhicule pour cette agence
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
