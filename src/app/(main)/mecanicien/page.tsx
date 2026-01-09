"use client"

import { useState } from "react"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"
import { Car, Calendar, User, MapPin, Eye, Wrench, Search } from "lucide-react"
import { useBases } from "./shared/useBases.api"
import { useStatusInt } from "./shared/useStatusInt.api"
import { useInterventions } from "./shared/useinterventions.api"
import { useClients } from "./shared/useClient.api"

const statusStyles: Record<string, string> = {
  EN_COURS: "bg-blue-100 text-blue-700",
  ATTENTE_PIECES: "bg-orange-100 text-orange-700",
  TERMINEE: "bg-green-100 text-green-700",
}

const STATUS_UI_MAP: Record<string, string> = {
  CONFIRMED_IN_PLANNING: "EN_COURS",
  EN_REPARATION: "EN_COURS",
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
  TERMINE: "TERMINEE",
}

export default function MecanicienPage() {
  const [filterStatus, setFilterStatus] = useState<"EN_COURS" | "TERMINEE">("EN_COURS")
  const [clientId, setClientId] = useState<string>()
  const [baseId, setBaseId] = useState<string>()
  const [search, setSearch] = useState("")

  const { clients } = useClients()
  const { bases } = useBases(clientId)
  const { interventions, setInterventions, loading } = useInterventions(undefined, clientId, baseId, search)
  const { updateStatus, loading: statusLoading, error: statusError } = useStatusInt()

  const filteredInterventions = interventions.filter(inv => STATUS_UI_MAP[inv.status] === filterStatus)

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <Wrench />
          </div>
          <h1 className="text-2xl font-bold">Espace Mécanicien</h1>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select onValueChange={setClientId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select onValueChange={setBaseId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Agence" />
              </SelectTrigger>
              <SelectContent>
                {bases.map(b => <SelectItem key={b.id} value={b.id}>{b.location}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Input placeholder="Rechercher plaque ou accord..." value={search} onChange={e => setSearch(e.target.value)} />
            <Button size="icon" variant="outline"><Search size={18} /></Button>
          </div>
        </div>

        {/* Statut filter */}
        <div className="flex gap-2">
          <Button onClick={() => setFilterStatus("EN_COURS")} variant={filterStatus === "EN_COURS" ? "default" : "outline"}>En cours</Button>
          <Button onClick={() => setFilterStatus("TERMINEE")} variant={filterStatus === "TERMINEE" ? "default" : "outline"}>Terminées</Button>
        </div>

        {/* Liste */}
        <div className="space-y-4">
          {loading && <p>Chargement...</p>}
          {!loading && filteredInterventions.map(inv => {
            const uiStatus = STATUS_UI_MAP[inv.status]

            return (
              <div key={inv.id} className="border rounded-xl p-5 flex flex-col gap-4 lg:flex-row lg:items-center hover:shadow-md transition">
                <div className="flex items-start gap-3 flex-1">
                  <Car className="text-gray-400 mt-1" />
                  <div>
                    <p className="font-bold">{inv.vehicle.licensePlate}</p>
                    <p className="text-sm text-gray-500">{inv.vehicle.brand} {inv.vehicle.model}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 flex-1">
                  <Calendar className="text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">{inv.accordNumber || "—"}</p>
                    <p className="text-sm text-gray-500">{inv.createdAt.slice(0, 10)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 flex-1">
                  <User className="text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">{inv.vehicle.client.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} />
                      {inv.vehicle.base.location}
                    </p>
                  </div>
                </div>

                {/* Statut (modifiable) */}
                <Select
  defaultValue={uiStatus}
  onValueChange={async (val) => {
    const success = await updateStatus(inv.id, val as any)
    if (!success) return alert(statusError || "Impossible de mettre à jour le statut")

    // ✅ Mise à jour locale pour ne pas recharger la page
    setInterventions(prev =>
      prev.map(item =>
        item.id === inv.id ? { ...item, status: Object.keys(STATUS_UI_MAP).find(key => STATUS_UI_MAP[key] === val) || item.status } : item
      )
    )
  }}
>

                  <SelectTrigger className={`w-[180px] ${statusStyles[uiStatus]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="ATTENTE_PIECES">Attente pièces</SelectItem>
                    <SelectItem value="TERMINEE">Terminée</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="gap-2"><Eye size={16} />Détails</Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
