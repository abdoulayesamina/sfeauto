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
          <div 
            key={agence.id} 
            className="mt-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
          >
            {/* Header de l'agence */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-800">
                  {agence.location}
                </span>

                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {vehiculesAgence.length} véhicule{vehiculesAgence.length > 1 && "s"}
                </span>
              </div>
            </div>

            {/* Liste des véhicules */}
            <div className="p-4">
              {vehiculesAgence.length > 0 ? (
                <div className="grid gap-3"> {/* Ajout d'un gap entre les items */}
                  {vehiculesAgence.map((v: any) => (
                    <VehicleItem
                      key={v.id}
                      vehicle={v}
                      clients={clients}
                      compact
                      onClick={() => onSelect(v)}
                      reloadVehicles={() => reloadVehicles?.()}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-100 py-10">
                  <div className="mb-2 text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-400">Aucun véhicule disponible</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}
