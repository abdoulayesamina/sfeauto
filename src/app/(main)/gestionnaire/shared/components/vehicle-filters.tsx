import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"
import { Agence } from "@/src/utils/types/agence"
import { Client } from "@/src/utils/types/client"

type VehicleFiltersProps = {
  clients: Client[]
  agences: Agence[]
}

export function VehicleFilters({ clients, agences }: VehicleFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      
      {/* Filtre par client */}
      <Select>
        <SelectTrigger className="h-16">
          <SelectValue placeholder="Trier par client" />
        </SelectTrigger>

        <SelectContent>
          {clients.map((client) => (
            <SelectItem
              key={client.id}
              value={client.id}
            >
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre par agence */}
      <Select>
        <SelectTrigger className="h-16">
          <SelectValue placeholder="Trier par agence" />
        </SelectTrigger>

        <SelectContent>
          {agences.map((agence) => (
            <SelectItem
              key={agence.id}
              value={agence.id}
            >
              {agence.location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre par statut */}
      <Select>
        <SelectTrigger className="h-16">
          <SelectValue placeholder="Statut du véhicule" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="CONFIRME">Confirmé</SelectItem>
          <SelectItem value="ATTENTE_PIECES">Attente pièces</SelectItem>
          <SelectItem value="EN_REPARATION">En réparation</SelectItem>
          <SelectItem value="TERMINE">Terminé</SelectItem>
          <SelectItem value="SANS_INTERVENTION">Sans intervention</SelectItem>
        </SelectContent>
      </Select>

    </div>
  )
}