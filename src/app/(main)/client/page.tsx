"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import {
  Search,
  Wrench,
  Car,
  User,
  Calendar,
  MapPin,
  Eye,
} from "lucide-react"
import { useState } from "react"
import { VehicleStats } from "../gestionnaire/shared/components/vehicule-stats"

const interventionsMock = [
  {
    id: 1,
    plaque: "DDDF",
    vehicule: "Citroën Mégane",
    numero: "123456789",
    date: "17/12/2025",
    client: "Dave DI",
    agence: "Charles de Gaulle",
    status: "EN_COURS",
  },
  {
    id: 2,
    plaque: "AA-987-ZZ",
    vehicule: "Toyota Corolla",
    numero: "987654321",
    date: "12/12/2025",
    client: "Moussa Traoré",
    agence: "Bamako Centre",
    status: "ATTENTE_PIECES",
  },
  {
    id: 3,
    plaque: "BB-456-KL",
    vehicule: "Peugeot 308",
    numero: "456123789",
    date: "05/12/2025",
    client: "Aminata Diallo",
    agence: "Sotuba",
    status: "TERMINEE",
  },
]

const statusStyles: Record<string, string> = {
  EN_COURS: "bg-blue-100 text-blue-700",
  ATTENTE_PIECES: "bg-orange-100 text-orange-700",
  TERMINEE: "bg-green-100 text-green-700",
}

const statusLabel: Record<string, string> = {
  EN_COURS: "En cours",
  ATTENTE_PIECES: "Attente pièces",
  TERMINEE: "Terminée",
}

export default function ClientPage() {
  const [filterStatus, setFilterStatus] = useState("EN_COURS")

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">

        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <User />
            </div>
            <h1 className="text-2xl font-bold">Espace Client</h1>
        </div>

        <div>
            <div className="flex items-center gap-2 sm:max-w-[90%] sm:mx-auto">
                <Input placeholder="Rechercher..." className="h-14 flex-1 " />
                <Button size="icon" variant="outline">
                    <Search size={18} />
                </Button>
            </div>
        </div>
        <VehicleStats total={3} enCours={1} termine={1} sansIntervention={1} />

        <div className="flex gap-2">
            <Button
                onClick={() => setFilterStatus("EN_COURS")}
                variant={filterStatus === "EN_COURS" ? "default" : "outline"}
            >
                En cours
            </Button>
            <Button
                onClick={() => setFilterStatus("TERMINEE")}
                variant={filterStatus === "TERMINEE" ? "default" : "outline"}
            >
                Terminées
            </Button>
        </div>

        <div className="space-y-4">
          {interventionsMock
            .filter(i => i.status === filterStatus)
            .map(intervention => (
                <div
                    key={intervention.id}
                    className="border rounded-xl p-5 flex flex-col gap-4 lg:flex-row lg:items-center hover:shadow-md transition"
                >
                    <div className="flex items-start gap-3 flex-1">
                        <Car className="text-gray-400 mt-1" />
                        <div>
                            <p className="font-bold">{intervention.plaque}</p>
                            <p className="text-sm text-gray-500">
                            {intervention.vehicule}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 flex-1">
                        <Calendar className="text-gray-400 mt-1" />
                        <div>
                            <p className="font-medium">{intervention.numero}</p>
                            <p className="text-sm text-gray-500">
                            {intervention.date}
                            </p>
                        </div>
                    </div>

                    <span
                    className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${statusStyles[intervention.status]}`}
                    >
                        {statusLabel[intervention.status]}
                    </span>

                    <Button variant="outline" className="gap-2">
                        <Eye size={16} />
                        Détails
                    </Button>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}


