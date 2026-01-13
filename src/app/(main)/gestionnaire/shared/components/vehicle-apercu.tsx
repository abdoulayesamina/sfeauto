"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Car, User, MapPin, Calendar, Wrench, CheckCircle2, PlusCircle, Eye } from "lucide-react"
import { useState } from "react"
import { getStatusMeta, statusStyles } from "../../../mecanicien/page"
import { Modal } from "@/src/shared/components/modal"
import InterventionDetail from "../../../mecanicien/shared/components/intervention-detail"

type VehiclePreviewProps = {
  licensePlate: string
  brand: string
  model: string
  year: number
  client: string
  agence: string
  entreeDate: string
  color: string
  enReparation: number
  termine: number
  onNewIntervention: () => void
}

const mockInterventions = [
  {
    id: "1",
    accord: "ACCBGH",
    description: "Vidange moteur",
    dateConfirmation: "17/12/2025",
    status: "TERMINEE",
  },
  {
    id: "2",
    accord: "ACC907i9))(",
    description: "Pare-brise cassé",
    dateConfirmation: "17/12/2025",
    status: "TERMINEE",
  },
  {
    id: "3",
    accord: "ACC445TR",
    description: "Changement plaquettes",
    dateConfirmation: "18/12/2025",
    status: "EN_COURS",
  },
]

export function VehiclePreview({
  licensePlate,
  brand,
  model,
  year,
  client,
  agence,
  entreeDate,
  color,
  enReparation,
  termine,
  onNewIntervention,
}: VehiclePreviewProps) {

  const [filteredStatus,setFilteredStatus] = useState("EN_COURS");
  const [openDetailModal,setOpenDetailModal] = useState(false);
  const [interventionDetail,setInterventionDetail] = useState<any>();

  function handleViewDetail(intervention: any): void {
    setInterventionDetail(intervention);
    setOpenDetailModal(true);
  }


  return (
    <div className="rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-5 shadow-sm flex flex-col gap-4">

      <div className="rounded-xl bg-gradient-to-r from-black to-gray-900 p-6 text-white shadow-lg">
        
        <h1 className="text-2xl font-bold mb-4">{licensePlate}</h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-white/70">Véhicule</p>
            <p className="font-semibold">{brand} {model}</p>
          </div>

          <div>
            <p className="text-white/70">Année & Couleur</p>
            <p className="font-semibold">{year} • {color}</p>
          </div>

          <div>
            <p className="text-white/70">Client</p>
            <p className="font-semibold">{client}</p>
          </div>

          <div>
            <p className="text-white/70">Base</p>
            <p className="font-semibold">{agence}</p>
          </div>

          <div>
            <p className="text-white/70">Date d’entrée</p>
            <p className="font-semibold">{new Date(entreeDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant={filteredStatus=="EN_COURS" ? "default" : "outline"} className="font-medium" onClick={()=>setFilteredStatus("EN_COURS")}>
          En cours ({enReparation})
        </Button>

        <Button variant={filteredStatus=="TERMINEE" ? "default" : "outline"} className="font-medium" onClick={()=>setFilteredStatus("TERMINEE")}>
          Terminées ({termine})
        </Button>
      </div>

      <div className="mt-6 space-y-4 p-2 min-h-[350px] max-h-[350px] overflow-auto">
        {mockInterventions
          .filter(i => i.status === filteredStatus)
          .map(intervention => (
            <div
              key={intervention.id}
              className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-zinc-800">
                    {intervention.description}
                  </p>

                  <div className="flex gap-4 mt-2 text-sm text-zinc-500">
                    <span>
                      <strong>N° Accord :</strong> {intervention.accord}
                    </span>
                    <span>
                      Confirmé le : {intervention.dateConfirmation}
                    </span>
                  </div>

                  <button className="flex items-center gap-2 mt-3 text-blue-600 text-sm font-medium hover:underline"
                    onClick={()=>handleViewDetail(intervention)}
                  >
                    <Eye size={16} />
                    Cliquer pour voir tous les détails
                  </button>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[intervention.status]} `}>
                  Réparation {intervention.status}
                </span>
              </div>
            </div>
        ))}
      </div>
      <div className="flex justify-center pt-2">
         <Button className="flex items-center gap-2 w-full h-[50px]" onClick={onNewIntervention}>
           <PlusCircle size={18} />
           Nouvelle intervention
         </Button>
      </div>
      
      <Modal open={openDetailModal} onClose={()=>setOpenDetailModal(false)} >
        <InterventionDetail getStatusMeta={getStatusMeta} 
          selectedIntervention={interventionDetail} 
          onClose={()=>setOpenDetailModal(false)}
        />
      </Modal>

    </div>
  )
}



// return (
//     <div className="rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-5 shadow-sm flex flex-col gap-4">

//       {/* En-tête véhicule */}
//       <div className="flex items-center gap-3">
//         <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
//           <Car size={22} />
//         </div>
//         <div className="flex flex-col">
//           <span className="text-lg font-semibold text-zinc-800">{licensePlate}</span>
//           <span className="text-sm text-zinc-500">{brand} {model} • {year}</span>
//         </div>
//       </div>

//       {/* Infos client / agence / date */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="flex items-center gap-3 rounded-lg border p-4">
//           <User className="text-zinc-400" size={18} />
//           <div>
//             <p className="text-xs text-zinc-400">Client</p>
//             <p className="font-medium text-zinc-700">{client}</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 rounded-lg border p-4">
//           <MapPin className="text-zinc-400" size={18} />
//           <div>
//             <p className="text-xs text-zinc-400">Agence</p>
//             <p className="font-medium text-zinc-700">{agence}</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 rounded-lg border p-4">
//           <Calendar className="text-zinc-400" size={18} />
//           <div>
//             <p className="text-xs text-zinc-400">Date d’entrée</p>
//             <p className="font-medium text-zinc-700">{entreeDate}</p>
//           </div>
//         </div>
//       </div>

//       {/* Statuts */}
//       <div className="flex flex-col sm:flex-row gap-3">
//         <div className="flex-1 rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3">
//           <Wrench className="text-yellow-600" />
//           <div>
//             <p className="text-xs text-yellow-700">En réparation</p>
//             <p className="text-xl font-bold text-yellow-800">{enReparation}</p>
//           </div>
//         </div>

//         <div className="flex-1 rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
//           <CheckCircle2 className="text-green-600" />
//           <div>
//             <p className="text-xs text-green-700">Terminé</p>
//             <p className="text-xl font-bold text-green-800">{termine}</p>
//           </div>
//         </div>
//       </div>

//       {/* Bouton nouvelle intervention */}
//       <div className="flex justify-center pt-2">
//         <Button className="flex items-center gap-2" onClick={onNewIntervention}>
//           <PlusCircle size={18} />
//           Nouvelle intervention
//         </Button>
//       </div>

//     </div>
//   )