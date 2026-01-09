import { VehicleItem } from "./vehicle-Item"

export function VehicleListAll({
  vehicles,
  clients,
  agences,
  onSelect,
}: any) {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Aucun véhicule pour le moment
      </div>
    )
  }

  return (
    <>
      {vehicles.map((v: any) => (
        <VehicleItem
          key={v.licensePlate}
          vehicle={v}
          clients={clients}
          agences={agences}
          onClick={() => onSelect(v)}
        />
      ))}
    </>
  )
}