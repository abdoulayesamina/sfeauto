"use client";

import { useMemo } from "react";
import { Search, X } from "lucide-react";

import { VehicleListAll } from "./vehicle-list-all";
import { VehicleListByAgence } from "./vehicle-list-by-agence";
import { vehicleMatchesStatutFilter } from "@/src/utils/constants/intervention-status";

type VehicleListCardProps = {
  filterByAllVehicule: boolean;
  vehicles: any[];
  clients: any[];
  agences: any[];
  accordSearch?: string;
  onAccordSearchChange?: (value: string) => void;
  onSelect: (vehicle: any) => void;
  reloadVehicles?: () => void;
  activeStatut?: string;
};

export function VehicleListCard({
  filterByAllVehicule,
  vehicles,
  clients,
  agences,
  accordSearch = "",
  onAccordSearchChange,
  onSelect,
  reloadVehicles,
  activeStatut,
}: VehicleListCardProps) {
  // Le backend inclut un véhicule dès qu'une de ses interventions a le statut
  // brut demandé, mais le statut affiché (adapté côté client) peut différer
  // pour des interventions "legacy" — on revérifie ici pour ne montrer que
  // les véhicules ayant vraiment une intervention au statut filtré.
  const filteredVehicles = useMemo(
    () => vehicles.filter((v) => vehicleMatchesStatutFilter(v, activeStatut)),
    [vehicles, activeStatut],
  );

  return (
    <div className="mt-2 border p-3 rounded">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b p-2 bg-gray-700 backdrop-blur-xl text-white rounded">

        <div className="flex items-center gap-2 font-bold">
          <h1>Liste des véhicules</h1>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <input
            type="text"
            value={accordSearch}
            onChange={(e) => onAccordSearchChange?.(e.target.value)}
            placeholder="Rechercher par N° d'accord..."
            className="w-full rounded-md bg-white/10 border border-white/20 pl-9 pr-8 py-1.5 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          {accordSearch && (
            <button
              type="button"
              onClick={() => onAccordSearchChange?.("")}
              title="Effacer la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[500px] overflow-auto mb-4">
        {filterByAllVehicule ? (
          <VehicleListAll
            vehicles={filteredVehicles}
            clients={clients}
            agences={agences}
            onSelect={onSelect}
            reloadVehicles={() => reloadVehicles?.()}
          />
        ) : (
          <VehicleListByAgence
            vehicles={filteredVehicles}
            agences={agences}
            clients={clients}
            onSelect={onSelect}
            reloadVehicles={() => reloadVehicles?.()}
          />
        )}
      </div>
    </div>
  );
}
