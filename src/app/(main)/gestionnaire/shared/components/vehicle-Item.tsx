"use client"

import { Vehicule } from "@/src/utils/types/vehicule"
import { Client } from "@/src/utils/types/client"
import { Agence } from "@/src/utils/types/agence"
import { DiamondPlus } from "lucide-react"
import { useState } from "react"
import { InterventionForm } from "../../form/intervention-form"
import { Button } from "@/src/shared/components/ui/button"
import { Modal } from "@/src/shared/components/modal"
import { useInterventionApi } from "../useIntervention.api"

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
  const clientName = clients.find(c => c.id === vehicle.client?.id)?.name ?? "—"
  const agenceName = agences?.find(a => a.id === vehicle.base?.id)?.location ?? "—"
  const [interventionModalOpen, setInterventionModalOpen] = useState(false)

  const { createIntervention, loading } = useInterventionApi()
  const handleIntervention = () => setInterventionModalOpen(true)

  // Comptage des statuts
  const enReparationCount = vehicle.invoices?.filter(
    i => i.status === "EN_REPARATION" || i.status === "FIXING_STARTED"
  )?.length ?? 0

  const termineCount = vehicle.invoices?.filter(
    i => i.status === "TERMINE" || i.status === "FIXING_FINISHED"
  )?.length ?? 0

  // Vérifie si aucune intervention
  const aucuneIntervention = (vehicle.invoices?.length ?? 0) === 0

  const handleSubmitIntervention = async (data: any) => {
    await createIntervention({
      vehicleId: vehicle.id, // important
      accordNumber: data.numeroAccord,
      dateOfConfirmation: data.dateConfirmation,
      workDescription: data.descriptionTravaux,
      didOrderParts: data.piecesCommande === "oui",
      ordersDetails: data.detailsCommande || null,
      comments: data.commentaires || null,
    })
    setInterventionModalOpen(false)
  }

  return (
    <div className="border shadow mt-3 rounded flex flex-col lg:flex-row lg:items-center gap-2">
      {/* Info véhicule */}
      <div
        className="flex flex-col lg:flex-row lg:items-center gap-2 flex-1 p-4 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span className="font-bold text-gray-800">{vehicle.licensePlate}</span>
          <span className="text-gray-500 italic">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 text-gray-600 text-sm mt-1 md:mt-0">
          <span>{clientName}</span>
          {!compact && <span>· {agenceName}</span>}
          <span>· Entrée: {vehicle.entryDate.toString().slice(0, 10)}</span>
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
        {aucuneIntervention && (
          <span className="bg-gray-100 text-gray-800 font-bold text-xs px-2 py-0.5 rounded-full">
            Aucune intervention
          </span>
        )}
        <Button className="text-sm px-3 py-1" onClick={handleIntervention}>
          <DiamondPlus className="mr-1 h-4 w-4" />
          Intervention
        </Button>
      </div>

      {/* Modal intervention */}
      <Modal open={interventionModalOpen} onClose={() => setInterventionModalOpen(false)} modalTitle="Créer une intervention">
        <InterventionForm
          vehicleDisplayText={`${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}`}
          defaultAccordNumber="ACC-2026-001"
          onSubmit={handleSubmitIntervention}
          onClose={() => setInterventionModalOpen(false)}
          loading={loading}
        />
      </Modal>
    </div>
  )
}
