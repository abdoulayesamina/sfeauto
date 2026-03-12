"use client"

import { useEffect, useState } from "react"
import { Vehicule } from "@/src/utils/types/vehicule"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Button } from "@/src/shared/components/ui/button"
import { useAgenceApi } from "@/src/shared/hooks/useAgence.api"
import { useClientApi } from "@/src/shared/hooks/useClient.api"
import { BrandSelect } from "@/src/shared/components/ui/BrandSelect"
import { ModelSelect } from "@/src/shared/components/ui/ModelSelect"
import { formatLicensePlate } from "@/src/utils/formatters"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Spinner } from "@/src/shared/components/spinner"

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
  loading,
}: {
  onClose: () => void
  onSubmit: (vehicule: Vehicule) => void
  mode: "create" | "edit"
  data?: Vehicule
  loading?: boolean
}) {
  const { getClients } = useClientApi()
  const { getAgences } = useAgenceApi()

  const [vehicule, setVehicule] = useState<Vehicule>({
    baseId: "",
    clientId: "",
    licensePlate: "",
    brandId: undefined,
    modelId: undefined,
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
  const [lookupLoading, setLookupLoading] = useState(false)

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

  const handleLookup = async () => {

  if (!vehicule.licensePlate) {
    alert("Veuillez saisir une immatriculation")
    return
  }

  try {

    setLookupLoading(true)

    const res = await fetch(
      `/api/vehicles/lookup/${vehicule.licensePlate}`
    )

    const result = await res.json()

    // ---------------------------
    // CAS 1 : véhicule déjà en DB
    // ---------------------------
    if (result.found) {

      const v = result.vehicle

      setVehicule((prev) => ({
        ...prev,
        brandId: v.brandId ?? prev.brandId,
        year: v.year ?? prev.year,
        energy: v.energy ?? prev.energy,
        doorsCount: v.doorsCount ?? prev.doorsCount,
        bodyType: v.bodyType ?? prev.bodyType
      }))

      // attendre un render React
      await new Promise((r) => setTimeout(r, 0))

      setVehicule((prev) => ({
        ...prev,
        modelId: v.modelId ?? prev.modelId
      }))

      return
    }

    // ---------------------------
    // CAS 2 : API externe
    // ---------------------------
    if (result.data) {

      const d = result.data

      setVehicule((prev) => ({
        ...prev,
        brandId: d.brandId ?? prev.brandId,
        year: d.year ?? prev.year,
        energy: d.energy ?? prev.energy,
        doorsCount: d.doorsCount ?? prev.doorsCount,
        bodyType: d.bodyType ?? prev.bodyType,
        color: d.color ?? prev.color,
        realPowerHp: d.realPowerHp ?? prev.realPowerHp,
        fiscalPowerCv: d.fiscalPowerCv ?? prev.fiscalPowerCv,
        gearboxType: d.gearboxType ?? prev.gearboxType,
        firstRegistrationDate: d.firstRegistrationDate ?? prev.firstRegistrationDate,
        registrationCardDate: d.registrationCardDate ?? prev.registrationCardDate,
        version: d.version ?? prev.version,
      }))

      await new Promise((r) => setTimeout(r, 0))

      setVehicule((prev) => ({
        ...prev,
       modelId: d.modelId,
        model: {
          id: d.modelId,
          name: d.modelName
        }
      }))
    }

  } catch (err) {
    console.error("Erreur lookup véhicule :", err)
  } finally {
    setLookupLoading(false)
  }
}
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

        <div className="flex gap-2">
          <Input
            id="immatriculation"
            placeholder="AA-123-BB"
            className="h-12"
            // value={vehicule.licensePlate}
            value={formatLicensePlate(vehicule.licensePlate || "")}
            onChange={(e) => {
            const normalized = e.target.value
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")

            setVehicule({
              ...vehicule,
              licensePlate: normalized
            })
          }}
          />

          <Button
            type="button"
            onClick={handleLookup}
            disabled={lookupLoading}
          >
            {lookupLoading ? <Spinner className="h-4 w-4" /> : "Rechercher"}
          </Button>
        </div>
      </div>

      {/* Marque / Modèle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="marque">Marque</Label>
          {/* <Input
            id="marque"
            placeholder="Renault"
            className="h-12"
            value={vehicule.brand || ""}
            onChange={(e) => setVehicule({ ...vehicule, brand: e.target.value })}
          /> */}
          <BrandSelect
            value={vehicule.brandId ?? null}
            onChange={(brandId) =>
              setVehicule({
                ...vehicule,
                brandId,
                modelId: null, // reset modèle
              })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="modele">Modèle</Label>
          <ModelSelect
            key={vehicule.brandId}  
            brandId={vehicule.brandId ?? null}
            value={vehicule.modelId ?? null}
            onChange={(modelId) =>
              setVehicule({
                ...vehicule,
                modelId,
              })
            }
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
            className="h-12"
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
            className="h-12"
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
            className="h-12"
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
            className="h-12"
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
            <SelectTrigger className="h-12">
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
            <SelectTrigger className="h-12">
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
            className="h-12"
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
            <SelectTrigger className="h-12">
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
            className="h-12"
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
            className="h-12"
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
          className="h-12"
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
          <SelectTrigger className="h-12">
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
          <SelectTrigger className="h-12">
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
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : ""}
          {mode === "edit" ? "Mettre à jour" : "Créer le véhicule"}
        </Button>
      </div>
    </form>
  )
}
