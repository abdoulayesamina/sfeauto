import { Modal } from "@/src/shared/components/modal"
import { Button } from "@/src/shared/components/ui/button"
import { DiamondPlus } from "lucide-react"
import { useState } from "react"
import { InterventionForm } from "../../form/intervention-form"

export function VehicleItem({
  vehicle,
  clients,
  agences,
  onClick,
  compact = false,
}: VehicleItemProps) {
  const clientName = clients.find(c => c.id === vehicle.client?.id)?.name ?? "—"
  const agenceName = agences?.find(a => a.id === vehicle.base?.id)?.location ?? "—"
  const [interventionModalOpen, setInterventionModalOpen] = useState(false)

  const handleIntervention = () => setInterventionModalOpen(true)

  // Calcul dynamique des stats
  const enReparationCount = vehicle.invoices?.filter(i => i.status === "EN_REPARATION" || i.status === "FIXING_STARTED")?.length ?? 0
  const termineCount = vehicle.invoices?.filter(i => i.status === "TERMINE" || i.status === "FIXING_FINISHED")?.length ?? 0

  return (
    <div className="border shadow mt-3 rounded flex flex-col lg:flex-row lg:items-center gap-2">
      {/* Info véhicule */}
      <div
        className="flex flex-col lg:flex-row lg:items-center gap-2 flex-1 p-4 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span className="font-bold text-gray-800">{vehicle.licensePlate}</span>
          <span className="text-gray-500 italic">{vehicle.brand} {vehicle.model} ({vehicle.year})</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 text-gray-600 text-sm mt-1 md:mt-0">
          <span>{clientName}</span>
          {!compact && <span>· {agenceName}</span>}
          <span>· Entrée: {vehicle.entryDate.toString().slice(0,10)}</span>
        </div>
      </div>

      {/* Stats dynamiques */}
      <div className="flex flex-col sm:flex-row items-center gap-2 p-4">
        {enReparationCount > 0 && (
          <span className="bg-yellow-100 text-yellow-800 font-bold text-xs px-2 py-0.5 rounded-full">
            {enReparationCount} en réparation
          </span>
        )}
        {termineCount > 0 && (
          <span className="bg-green-100 text-green-800 font-bold text-xs px-2 py-0.5 rounded-full">
            {termineCount} terminé
          </span>
        )}
        <Button className="text-sm px-3 py-1" onClick={handleIntervention}>
          <DiamondPlus className="mr-1 h-4 w-4" />
          Intervention
        </Button>
      </div>

      {/* Modal intervention */}
      <Modal open={interventionModalOpen} onClose={() => setInterventionModalOpen(false)}>
        <InterventionForm
          onSubmit={() => setInterventionModalOpen(false)}
          onClose={() => setInterventionModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
