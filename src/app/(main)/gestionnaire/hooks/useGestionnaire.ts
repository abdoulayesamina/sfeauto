"use client"
import { useState } from "react"
import { Client } from "@/src/utils/types/client"
import { Agence } from "@/src/utils/types/agence"

export function useGestionnaire() {
  const [vehiculeNotFound, setVehiculeNotFound] = useState(false)
  const [openCreateVehiculeModal, setOpenCreateVehiculeModal] = useState(false)
  const [apercuVehiculeOpen, setApercuVehiculeOpen] = useState(false)

  const mockClients: Client[] = [
    {
      id: "cl_001",
      name: "Garage Central Bamako",
      email: "contact@garage-bko.ml",
      phone: "+22370000001",
      createdAt: "",
      updatedAt: "",
      _count: { bases: 2, vehicles: 14 },
    },
  ]

  const mockAgences: Agence[] = [
    {
      id: "ag_001",
      location: "Hamdallaye ACI 2000",
      clientId: "cl_001",
      client: { name: "Garage Central Bamako" },
      createdAt: "",
      updatedAt: "",
      _count: { vehicles: 8 },
    },
  ]

  return {
    vehiculeNotFound,
    setVehiculeNotFound,
    openCreateVehiculeModal,
    setOpenCreateVehiculeModal,
    apercuVehiculeOpen,
    setApercuVehiculeOpen,
    mockClients,
    mockAgences,
  }
}
