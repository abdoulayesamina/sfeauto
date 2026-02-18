import { useEffect } from "react"
import { VehicleItem } from "./vehicle-Item"

export function VehicleListAll({
  vehicles,
  clients,
  agences,
  onSelect,
  reloadVehicles,
}: any) {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Aucun véhicule pour le moment
      </div>
    )
  }

  useEffect(() => {
    console.log("Vehicles dans VehicleListAll ---->", vehicles)
  }, [vehicles])

  return (
    <>
      {vehicles.map((v: any) => (
        <VehicleItem
          key={v.licensePlate}
          vehicle={v}
          clients={clients}
          agences={agences}
          onClick={() => onSelect(v)}
          reloadVehicles={()=> reloadVehicles?.()}
        />
      ))}
    </>
  )
}