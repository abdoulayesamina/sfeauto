import { CarFront, Loader, CheckCircle, AlertCircle } from "lucide-react"

type StatsCardProps = {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  bgClass: string
  borderClass: string
  valueClass: string
}

function StatsCard({
  title,
  value,
  description,
  icon,
  bgClass,
  borderClass,
  valueClass,
}: StatsCardProps) {
  return (
    <div className={`min-h-[150px] ${bgClass} ${borderClass} shadow rounded p-2 flex flex-col`}>
      <div className="flex flex-col flex-1">
        <div className="flex gap-3 items-center">
          <span>{icon}</span>
          <span className="font-bold text-lg">{title}</span>
        </div>
        <span className={`text-center w-full mt-2 text-4xl font-bold ${valueClass}`}>
          {value}
        </span>
      </div>
      <span className="text-gray-600 text-sm">{description}</span>
    </div>
  )
}

type VehicleStatsProps = {
  total: number
  enCours: number
  termine: number
  sansIntervention: number
}

export function VehicleStats({ total, enCours, termine, sansIntervention }: VehicleStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

      <StatsCard
        title="Total"
        value={total}
        description="Vehicule totale"
        icon={<CarFront color="blue" size={25} />}
        bgClass="bg-blue-50"
        borderClass="border border-blue-200"
        valueClass="text-blue-600"
      />

      <StatsCard
        title="En cours"
        value={enCours}
        description="Vehicule en cours"
        icon={<Loader color="orange" size={25} />}
        bgClass="bg-orange-50"
        borderClass="border border-orange-200"
        valueClass="text-orange-500"
      />

      <StatsCard
        title="Terminé"
        value={termine}
        description="Vehicule terminé"
        icon={<CheckCircle color="green" size={25} />}
        bgClass="bg-green-50"
        borderClass="border border-green-200"
        valueClass="text-green-600"
      />

      <StatsCard
        title="Sans int"
        value={sansIntervention}
        description="Vehicule sans intervention"
        icon={<AlertCircle color="red" size={25} />}
        bgClass="bg-red-50"
        borderClass="border border-red-200"
        valueClass="text-red-600"
      />

    </div>
  )
}
