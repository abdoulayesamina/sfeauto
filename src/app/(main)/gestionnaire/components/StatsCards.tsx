import { CarFront, Loader, CheckCircle, AlertCircle } from "lucide-react"

export function StatsCards() {
  const stats = [
    { label: "Total", value: 10, icon: <CarFront />, color: "blue" },
    { label: "En cours", value: 23, icon: <Loader />, color: "orange" },
    { label: "Terminé", value: 15, icon: <CheckCircle />, color: "green" },
    { label: "Sans int", value: 8, icon: <AlertCircle />, color: "red" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-${s.color}-50 border shadow rounded p-3`}
        >
          <div className="flex gap-2 items-center font-bold">
            {s.icon}
            {s.label}
          </div>
          <p className={`text-${s.color}-600 text-4xl text-center mt-4`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  )
}
