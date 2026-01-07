import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Client } from "@/src/utils/types/client"
import { Agence } from "@/src/utils/types/agence"

export function VehiculeFilters({
  clients,
  agences,
}: {
  clients: Client[]
  agences: Agence[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <Select>
        <SelectTrigger className="h-16">
          <SelectValue placeholder="Client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="h-16">
          <SelectValue placeholder="Agence" />
        </SelectTrigger>
        <SelectContent>
          {agences.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="h-16">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="EN_REPARATION">En réparation</SelectItem>
          <SelectItem value="TERMINE">Terminé</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
