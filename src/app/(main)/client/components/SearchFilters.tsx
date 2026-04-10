import { Input } from "@/src/shared/components/ui/input"
import { Button } from "@/src/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface SearchFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterStatus: "ALL" | "CONFIRMEE" | "EN_COURS" | "TERMINEE" | "ATTENTE_PIECES"
  onFilterChange: (value: "ALL" | "CONFIRMEE" | "EN_COURS" | "TERMINEE" | "ATTENTE_PIECES") => void
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: SearchFiltersProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Barre de recherche */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Rechercher une plaque ou une marque"
          className="pl-12 h-12 text-lg border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => onSearchChange("")}
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onFilterChange("ALL")}
            variant={filterStatus === "ALL" ? "default" : "outline"}
            className={cn(
              "rounded-lg transition-all",
              filterStatus === "ALL" && "shadow-md"
            )}
          >
            Toutes
          </Button>
          <Button
            onClick={() => onFilterChange("CONFIRMEE")}
            variant={filterStatus === "CONFIRMEE" ? "default" : "outline"}
            className={cn(
              "rounded-lg transition-all",
              filterStatus === "CONFIRMEE" && "shadow-md"
            )}
          >
            Confirmées
          </Button>
          <Button
            onClick={() => onFilterChange("EN_COURS")}
            variant={filterStatus === "EN_COURS" ? "default" : "outline"}
            className={cn(
              "rounded-lg transition-all",
              filterStatus === "EN_COURS" && "shadow-md"
            )}
          >
            En cours
          </Button>
          <Button
            onClick={() => onFilterChange("ATTENTE_PIECES")}
            variant={filterStatus === "ATTENTE_PIECES" ? "default" : "outline"}
            className={cn(
              "rounded-lg transition-all",
              filterStatus === "ATTENTE_PIECES" && "shadow-md"
            )}
          >
            Attente pièces
          </Button>
          <Button
            onClick={() => onFilterChange("TERMINEE")}
            variant={filterStatus === "TERMINEE" ? "default" : "outline"}
            className={cn(
              "rounded-lg transition-all",
              filterStatus === "TERMINEE" && "shadow-md"
            )}
          >
            Terminées
          </Button>
        </div>

        <Select
          value={filterStatus}
          onValueChange={(value: string) => onFilterChange(value as any)}
        >
          <SelectTrigger className="w-full sm:w-[240px] rounded-lg h-11 border-gray-300">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="CONFIRMEE">Confirmées</SelectItem>
            <SelectItem value="EN_COURS">En cours</SelectItem>
            <SelectItem value="ATTENTE_PIECES">Attente pièces</SelectItem>
            <SelectItem value="TERMINEE">Terminées</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}