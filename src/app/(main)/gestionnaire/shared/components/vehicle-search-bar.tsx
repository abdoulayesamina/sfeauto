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
    <div className="flex flex-1 items-center gap-2">
      <Input
        className="flex-1 min-w-[100px] md:max-w-xs"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <Button onClick={onSearch} className="shrink-0 whitespace-nowrap px-3 sm:px-4">
        <span className="sm:hidden">Créer</span>
        <span className="hidden sm:inline">Créer une intervention</span>
      </Button>
    </div>
  )
}