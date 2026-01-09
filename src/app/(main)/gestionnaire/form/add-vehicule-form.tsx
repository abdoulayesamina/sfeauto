"use client"

import { useEffect, useState } from "react"
import { Vehicule } from "@/src/utils/types/vehicule"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Button } from "@/src/shared/components/ui/button"
import { useAgenceApi } from "@/src/shared/hooks/useAgence.api"
import { useClientApi } from "@/src/shared/hooks/useClient.api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"

export function AddVehiculeForm({
  onClose,
  onSubmit,
  mode,
  data,
}: {
  onClose: () => void
  onSubmit: (vehicule: Vehicule) => void
  mode: "create" | "edit"
  data?: Vehicule
}) {
  const { getClients } = useClientApi()
  const { getAgences } = useAgenceApi()

  const [vehicule, setVehicule] = useState<Vehicule>({
    baseId: "",
    clientId: "",
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
  })

  const [clients, setClients] = useState<any[]>([])
  const [agences, setAgences] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingAgences, setLoadingAgences] = useState(false)

  // Pré-remplir le formulaire en mode create ou edit
  useEffect(() => {
    if (mode === "create" && data?.licensePlate) {
      setVehicule((prev) => ({ ...prev, licensePlate: data.licensePlate }))
    }
    if (mode === "edit" && data) {
      setVehicule(data)
    }
  }, [data, mode])

  // Charger les clients
  useEffect(() => {
    setLoadingClients(true)
    getClients()
      .then((res) => setClients(res))
      .catch((err) => console.error("Erreur clients :", err))
      .finally(() => setLoadingClients(false))
  }, [])

  // Charger les agences quand le client change
  useEffect(() => {
    if (!vehicule.clientId) {
      setAgences([])
      setVehicule((prev) => ({ ...prev, baseId: "" }))
      return
    }

    setLoadingAgences(true)
    getAgences(vehicule.clientId)
      .then((res) => setAgences(res))
      .catch((err) => console.error("Erreur agences :", err))
      .finally(() => setLoadingAgences(false))
  }, [vehicule.clientId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicule.clientId) return alert("Veuillez sélectionner un client")
    if (!vehicule.baseId) return alert("Veuillez sélectionner une agence")
    if (!vehicule.licensePlate) return alert("Veuillez saisir l'immatriculation")
    onSubmit(vehicule)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Immatriculation */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="immatriculation">
          Immatriculation <span className="text-red-500">*</span>
        </Label>
        <Input
          id="immatriculation"
          placeholder="SSSSDDDD"
          className="h-16"
          value={vehicule.licensePlate}
          onChange={(e) =>
            setVehicule({ ...vehicule, licensePlate: e.target.value })
          }
        />
      </div>

      {/* Marque / Modèle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="marque">Marque</Label>
          <Input
            id="marque"
            placeholder="Renault"
            className="h-16"
            value={vehicule.brand}
            onChange={(e) => setVehicule({ ...vehicule, brand: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="modele">Modèle</Label>
          <Input
            id="modele"
            placeholder="Megane"
            className="h-16"
            value={vehicule.model}
            onChange={(e) => setVehicule({ ...vehicule, model: e.target.value })}
          />
        </div>
      </div>

      {/* Année / Couleur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="annee">Année</Label>
          <Input
            id="annee"
            type="number"
            placeholder="2023"
            className="h-16"
            value={vehicule.year}
            onChange={(e) =>
              setVehicule({ ...vehicule, year: Number(e.target.value) })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="couleur">Couleur</Label>
          <Input
            id="couleur"
            placeholder="Gris"
            className="h-16"
            value={vehicule.color}
            onChange={(e) =>
              setVehicule({ ...vehicule, color: e.target.value })
            }
          />
        </div>
      </div>

      {/* Client */}
      <div className="flex flex-col gap-2">
        <Label>Client <span className="text-red-500">*</span></Label>
        <Select
          value={vehicule.clientId || ""}
          onValueChange={(clientId) =>
            setVehicule({ ...vehicule, clientId, baseId: "" })
          }
        >
          <SelectTrigger className="h-16">
            <SelectValue placeholder={loadingClients ? "Chargement..." : "Sélectionnez un client"} />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Agence / Base */}
      <div className="flex flex-col gap-2">
        <Label>Agence <span className="text-red-500">*</span></Label>
        <Select
          value={vehicule.baseId || ""}
          onValueChange={(baseId) => setVehicule({ ...vehicule, baseId })}
          disabled={!vehicule.clientId || loadingAgences}
        >
          <SelectTrigger className="h-16">
            <SelectValue placeholder={!vehicule.clientId ? "Sélectionnez un client d'abord" : loadingAgences ? "Chargement..." : "Sélectionnez une agence"} />
          </SelectTrigger>
          <SelectContent>
            {agences.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {mode === "edit" ? "Mettre à jour" : "Créer le véhicule"}
        </Button>
      </div>
    </form>
  )
}
