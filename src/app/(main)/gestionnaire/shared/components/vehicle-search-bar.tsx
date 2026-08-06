import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"

type VehicleSearchBarProps = {
  value?: string
  onChange?: (value: string) => void
  onSearch: () => void
  placeholder?: string
}

export function VehicleSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Rechercher un véhicule",
}: VehicleSearchBarProps) {
  return (
    <div className="flex items-center justify-center p-1 shadow rounded">
      <div className="flex items-center justify-center gap-2 w-full md:w-[80%] flex-col md:flex-row mx-auto">
        <Input
          className="md:flex-1"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
        />
        <Button onClick={onSearch} className="w-full md:w-auto">
          Créer une intervention
        </Button>
      </div>
    </div>
  )
}