"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Eye, PlusCircle, Car, Wrench, User, MapPin } from "lucide-react"
import { useState } from "react"
import { Modal } from "@/src/shared/components/modal"
import { toUIStatus, getStatusMeta } from "@/src/utils/constants/intervention-status"
import IntervDetailGes from "./Intervention"

type VehiclePreviewProps = {
  licensePlate: string
  brand: string
  model: string
  year: number
  client: string
  agence: string
  entreeDate: string
  color: string
  invoices: any[]
  onNewIntervention: () => void
}

export function VehiclePreview({
  licensePlate,
  brand,
  model,
  year,
  client,
  agence,
  entreeDate,
  color,
  invoices,
  onNewIntervention,
}: VehiclePreviewProps) {

  const [filteredStatus, setFilteredStatus] = useState<"EN_COURS" | "TERMINEE">("EN_COURS")
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>()

  const filteredInvoices = invoices 
    .map(inv => ({ ...inv, uiStatus: toUIStatus(inv.status) }))
    .filter(inv =>
      filteredStatus === "EN_COURS" ? inv.uiStatus !== "TERMINEE" : inv.uiStatus === "TERMINEE"
    )

  const handleViewDetail = (invoice: any) => {
    setSelectedInvoice({
      ...invoice,
      vehicle: {
        licensePlate,
        brand,
        model,
        year,
        color,
        entryDate: entreeDate,
        client: { name: client },
        base: { location: agence },
      }
    })
    setOpenDetailModal(true)
  }

  return (
    <div className="rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-5 shadow-sm flex flex-col gap-4">

      {/* VEHICULE INFO */}
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

      {/* Boutons filtrage statut */}
      <div className="flex gap-3 mt-6">
        <Button
          variant={filteredStatus === "EN_COURS" ? "default" : "outline"}
          onClick={() => setFilteredStatus("EN_COURS")}
        >
          En cours ({invoices.filter(i => toUIStatus(i.status) !== "TERMINEE").length})
        </Button>
        <Button
          variant={filteredStatus === "TERMINEE" ? "default" : "outline"}
          onClick={() => setFilteredStatus("TERMINEE")}
        >
          Terminées ({invoices.filter(i => toUIStatus(i.status) === "TERMINEE").length})
        </Button>
      </div>

      {/* Liste des interventions */}
      <div className="mt-6 space-y-4 p-2 min-h-[350px] max-h-[350px] overflow-auto">
        {filteredInvoices.map(inv => {
          const meta = getStatusMeta(inv.uiStatus)
          return (
            <div key={inv.id} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-zinc-800">{inv.workDescription}</p>
                  <div className="flex gap-4 mt-2 text-sm text-zinc-500">
                    <span><strong>N° Accord :</strong> {inv.accordNumber}</span>
                    <span>
                      Confirmé le : {new Date(inv.dateOfConfirmation).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    className="flex items-center gap-2 mt-3 text-blue-600 text-sm font-medium hover:underline"
                    onClick={() => handleViewDetail(inv)}
                  >
                    <Eye size={16} />
                    Voir tous les détails
                  </button>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nouvelle intervention */}
      <div className="flex justify-center pt-2">
        <Button className="flex items-center gap-2 w-full h-[50px]" onClick={onNewIntervention}>
          <PlusCircle size={18} />
          Nouvelle intervention
        </Button>
      </div>

      {/* Modal détails */}
      <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)} modalDescription="Détail de l'intervention">
        {selectedInvoice && (
          <IntervDetailGes
            selectedIntervention={selectedInvoice}
            onClose={() => setOpenDetailModal(false)}
          />
        )}
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