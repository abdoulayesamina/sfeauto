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

const ENERGY_OPTIONS = ["GAZOLE", "ESSENCE", "HYBRIDE", "ELECTRIQUE", "GPL"] as const
const GEARBOX_OPTIONS = ["BVM", "BVA"] as const
const BODY_OPTIONS = [
  "BERLINE",
  "SUV",
  "BREAK",
  "COUPE",
  "CABRIOLET",
  "MONOSPACE",
  "PICKUP",
  "UTILITAIRE",
  "AUTRE",
] as const

function toISODateTime(dateValue: string) {
  if (!dateValue) return ""
  const d = new Date(dateValue) 
  if (isNaN(d.getTime())) return ""
  return d.toISOString()
}

function fromISOToDateInput(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

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

    firstRegistrationDate: undefined,
    energy: undefined,
    doorsCount: undefined,
    bodyType: undefined,
    realPowerHp: undefined,
    fiscalPowerCv: undefined,
    gearboxType: undefined,
    version: "",
    registrationCardDate: undefined,
  })

  const [clients, setClients] = useState<any[]>([])
  const [agences, setAgences] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingAgences, setLoadingAgences] = useState(false)

  useEffect(() => {
    if (mode === "create" && data?.licensePlate) {
      setVehicule((prev) => ({ ...prev, licensePlate: data.licensePlate }))
    }
    if (mode === "edit" && data) {
      setVehicule({
        ...data,
        version: data.version ?? "",
      })
    }
  }, [data, mode])

  useEffect(() => {
    setLoadingClients(true)
    getClients()
      .then((res) => setClients(res))
      .catch((err) => console.error("Erreur clients :", err))
      .finally(() => setLoadingClients(false))
  }, [])

  
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
            value={vehicule.brand || ""}
            onChange={(e) => setVehicule({ ...vehicule, brand: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="modele">Modèle</Label>
          <Input
            id="modele"
            placeholder="Megane"
            className="h-16"
            value={vehicule.model || ""}
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
            value={vehicule.year ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                year: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="couleur">Couleur</Label>
          <Input
            id="couleur"
            placeholder="Gris"
            className="h-16"
            value={vehicule.color || ""}
            onChange={(e) => setVehicule({ ...vehicule, color: e.target.value })}
          />
        </div>
      </div>

      {/* 1ère MEC / Date carte grise */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstRegistrationDate">1ère MEC</Label>
          <Input
            id="firstRegistrationDate"
            type="date"
            className="h-16"
            value={fromISOToDateInput(vehicule.firstRegistrationDate)}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                firstRegistrationDate: e.target.value ? toISODateTime(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="registrationCardDate">Date carte grise</Label>
          <Input
            id="registrationCardDate"
            type="date"
            className="h-16"
            value={fromISOToDateInput(vehicule.registrationCardDate)}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                registrationCardDate: e.target.value ? toISODateTime(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      {/* Energie / Carrosserie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label>Énergie</Label>
          <Select
            value={(vehicule.energy as string) || ""}
            onValueChange={(energy) => setVehicule({ ...vehicule, energy: energy as any })}
          >
            <SelectTrigger className="h-16">
              <SelectValue placeholder="Sélectionnez une énergie" />
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              {ENERGY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Carrosserie</Label>
          <Select
            value={(vehicule.bodyType as string) || ""}
            onValueChange={(bodyType) =>
              setVehicule({ ...vehicule, bodyType: bodyType as any })
            }
          >
            <SelectTrigger className="h-16">
              <SelectValue placeholder="Sélectionnez une carrosserie" />
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              {BODY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Nb Portes / Type de boîte */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="doorsCount">Nb Portes</Label>
          <Input
            id="doorsCount"
            type="number"
            placeholder="5"
            className="h-16"
            value={vehicule.doorsCount ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                doorsCount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Type de boîte</Label>
          <Select
            value={(vehicule.gearboxType as string) || ""}
            onValueChange={(gearboxType) =>
              setVehicule({ ...vehicule, gearboxType: gearboxType as any })
            }
          >
            <SelectTrigger className="h-16">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              {GEARBOX_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Puissances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="realPowerHp">Puissance réelle</Label>
          <Input
            id="realPowerHp"
            type="number"
            placeholder="128"
            className="h-16"
            value={vehicule.realPowerHp ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                realPowerHp: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="fiscalPowerCv">Puissance fiscale</Label>
          <Input
            id="fiscalPowerCv"
            type="number"
            placeholder="7"
            className="h-16"
            value={vehicule.fiscalPowerCv ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                fiscalPowerCv: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      {/* Version */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="version">Version</Label>
        <Input
          id="version"
          placeholder="1.6 CRDI"
          className="h-16"
          value={vehicule.version || ""}
          onChange={(e) => setVehicule({ ...vehicule, version: e.target.value })}
        />
      </div>

      {/* Client */}
      <div className="flex flex-col gap-2">
        <Label>
          Client <span className="text-red-500">*</span>
        </Label>
        <Select
          value={vehicule.clientId || ""}
          onValueChange={(clientId) =>
            setVehicule({ ...vehicule, clientId, baseId: "" })
          }
        >
          <SelectTrigger className="h-16">
            <SelectValue placeholder={loadingClients ? "Chargement..." : "Sélectionnez un client"} />
          </SelectTrigger>
          <SelectContent className="z-[2000]">
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
        <Label>
          Agence <span className="text-red-500">*</span>
        </Label>
        <Select
          value={vehicule.baseId || ""}
          onValueChange={(baseId) => setVehicule({ ...vehicule, baseId })}
          disabled={!vehicule.clientId || loadingAgences}
        >
          <SelectTrigger className="h-16">
            <SelectValue
              placeholder={
                !vehicule.clientId
                  ? "Sélectionnez un client d'abord"
                  : loadingAgences
                  ? "Chargement..."
                  : "Sélectionnez une agence"
              }
            />
          </SelectTrigger>
          <SelectContent className="z-[2000]">
            {agences.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
