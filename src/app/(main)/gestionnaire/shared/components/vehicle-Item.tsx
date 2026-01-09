import { Modal } from "@/src/shared/components/modal"
import { Button } from "@/src/shared/components/ui/button"
import { Agence } from "@/src/utils/types/agence"
import { Client } from "@/src/utils/types/client"
import { Vehicule } from "@/src/utils/types/vehicule"
import { DiamondPlus } from "lucide-react"
import { useState } from "react"
import { InterventionForm } from "../../form/intervention-form"

type VehicleItemProps = {
  vehicle: Vehicule
  clients: Client[]
  agences?: Agence[]
  onClick?: () => void
  compact?: boolean
}

export function VehicleItem({
  vehicle,
  clients,
  agences,
  onClick,

  compact = false,
}: VehicleItemProps) {
    const clientName = clients.find(c => c.id === vehicle.clientId)?.name
    const agenceName = agences?.find(a => a.id === vehicle.baseId)?.location
    const [interventionModalOpen, setInterventionModalOpen] = useState(false)
    const handleIntervention = ()=>{
        setInterventionModalOpen(true)
    }

  return (
    <div className="border shadow mt-3 rounded flex flex-col lg:flex-row lg:items-center gap-2">
      
      <div
        className="flex flex-col lg:flex-row lg:items-center gap-2 flex-1 p-4 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span className="font-bold text-gray-800">
            {vehicle.licensePlate}
          </span>
          <span className="text-gray-500 italic">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 text-gray-600 text-sm">
          <span>{clientName ?? "—"}</span>
          {!compact && agenceName && <span>· {agenceName}</span>}
          <span>· Entrée: {vehicle.year}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 p-4">
        <span className="bg-yellow-100 text-yellow-800 font-bold text-xs px-2 py-0.5 rounded-full">
          1 en réparation
        </span>
        <span className="bg-green-100 text-green-800 font-bold text-xs px-2 py-0.5 rounded-full">
          1 terminé
        </span>
        <Button className="text-sm px-3 py-1" onClick={handleIntervention}>
          <DiamondPlus className="mr-1 h-4 w-4" />
          Intervention
        </Button>
      </div>

      <Modal open={interventionModalOpen} onClose={()=>setInterventionModalOpen(false)} modalTitle="Créer une intervention" >
            <InterventionForm onSubmit={()=>setInterventionModalOpen(false)} onClose={()=>setInterventionModalOpen(false)}/>
      </Modal>

    </div>
  )
}