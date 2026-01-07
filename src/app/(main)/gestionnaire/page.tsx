"use client"

import { SearchBar } from "./components/SearchBar"
import { StatsCards } from "./components/StatsCards"
import { VehiculeFilters } from "./components/VehiculeFilters"
import { VehiculeNotFound } from "./components/VehiculeNotFound"
import { useGestionnaire } from "./hooks/useGestionnaire"
import { ApercuVehiculeModal } from "./modals/apercuvehiculeModal"
import { CreateVehiculeModal } from "./modals/CreateVehiculeModal"

export default function GestionnairePage() {
  const g = useGestionnaire()

  return (
    <div className="p-6 bg-zinc-50 min-h-screen">
      <h1 className="text-2xl font-bold">Page Gestionnaire</h1>

      <SearchBar onSearch={() => g.setVehiculeNotFound(true)} />

      {!g.vehiculeNotFound ? (
        <>
          <VehiculeFilters
            clients={g.mockClients}
            agences={g.mockAgences}
          />
          <StatsCards />
        </>
      ) : (
        <VehiculeNotFound
          onBack={() => g.setVehiculeNotFound(false)}
          onCreate={() => g.setOpenCreateVehiculeModal(true)}
        />
      )}

      <CreateVehiculeModal
        open={g.openCreateVehiculeModal}
        onClose={() => g.setOpenCreateVehiculeModal(false)}
      />

      <ApercuVehiculeModal
        open={g.apercuVehiculeOpen}
        onClose={() => g.setApercuVehiculeOpen(false)}
      />
    </div>
  )
}
