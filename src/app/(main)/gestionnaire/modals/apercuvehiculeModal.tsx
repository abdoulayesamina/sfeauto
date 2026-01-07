"use client"

import { Modal } from "@/src/shared/components/modal"
import {
  Car,
  User,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle2,
  PlusCircle,
} from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"

type Props = {
  open: boolean
  onClose: () => void
}

export function ApercuVehiculeModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} modalTitle="Aperçu véhicule">
      <div className="space-y-6 max-h-[500px] overflow-auto">

        {/* Véhicule */}
        <div className="rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Car size={22} />
            </div>
            <div>
              <p className="text-lg font-semibold">DDDF</p>
              <p className="text-sm text-zinc-500">Citroën Megane • 2025</p>
            </div>
          </div>
        </div>

        {/* Infos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Info icon={<User size={18} />} label="Client" value="Dave DI" />
          <Info icon={<MapPin size={18} />} label="Agence" value="Charles de Gaulle" />
          <Info icon={<Calendar size={18} />} label="Date d’entrée" value="17/12/2025" />
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <Stat
            icon={<Wrench />}
            label="En réparation"
            value="1"
            color="yellow"
          />
          <Stat
            icon={<CheckCircle2 />}
            label="Terminé"
            value="1"
            color="green"
          />
        </div>

        <div className="flex justify-center">
          <Button className="flex items-center gap-2">
            <PlusCircle size={18} />
            Nouvelle intervention
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* petits composants internes */

function Info({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <span className="text-zinc-400">{icon}</span>
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="font-medium text-zinc-700">{value}</p>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, color }: any) {
  const colors: any = {
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    green: "bg-green-50 border-green-200 text-green-800",
  }

  return (
    <div className={`flex-1 rounded-lg border p-4 flex items-center gap-3 ${colors[color]}`}>
      {icon}
      <div>
        <p className="text-xs">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}
  
  
