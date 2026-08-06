import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Agence } from "@/src/utils/types/agence"
import { Client } from "@/src/utils/types/client"

type VehicleFiltersProps = {
  clients: Client[]
  agences: Agence[]
  clientId?: string
  agenceId?: string
  statut?: string
  onChange: (filters: {
    clientId?: string
    agenceId?: string
    statut?: string
  }) => void
}

export function VehicleFilters({
  clients,
  agences,
  clientId,
  agenceId,
  statut,
  onChange,
}: VehicleFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select
        value={clientId || "all"}
        onValueChange={(value) =>
          onChange({ clientId: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Filtrer par client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les clients</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.cli_id} value={client.cli_id}>
              {client.cli_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
  value={agenceId || "all"}
  onValueChange={(value) =>
    onChange({ agenceId: value === "all" ? undefined : value })
  }
>
  <SelectTrigger className="h-12">
    <SelectValue placeholder="Filtrer par agence" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Toutes les agences</SelectItem>
    {agences.map((agence) => (
      <SelectItem key={agence.bas_id} value={agence.bas_id}>
        {agence.bas_location}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


      <Select
        value={statut || "all"}
        onValueChange={(value) =>
          onChange({ statut: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Statut du véhicule" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="WAITING_FOR_PARTS">Attente pièces</SelectItem>
          <SelectItem value="FIXING_STARTED">En réparation</SelectItem>
          <SelectItem value="FIXING_FINISHED">Terminé</SelectItem>
          <SelectItem value="SANS_INTERVENTION">Sans intervention</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
