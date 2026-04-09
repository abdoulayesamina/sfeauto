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
import { toast } from "sonner"
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
    veh_baseId: "",
    veh_clientId: "",
    veh_licensePlate: "",
    veh_brandId: undefined,
    veh_modelId: undefined,
    veh_year: new Date().getFullYear(),
    veh_color: "",
    veh_kilometrage: "",

    veh_firstRegistrationDate: undefined,
    veh_energy: undefined,
    veh_doorsCount: undefined,
    veh_bodyType: undefined,
    veh_realPowerHp: undefined,
    veh_fiscalPowerCv: undefined,
    veh_gearboxType: undefined,
    veh_version: "",
    veh_registrationCardDate: undefined,

  })

  const [clients, setClients] = useState<any[]>([])
  const [agences, setAgences] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingAgences, setLoadingAgences] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)

  useEffect(() => {
    if (mode === "create" && data?.veh_licensePlate) {
      setVehicule((prev) => ({ ...prev, veh_licensePlate: data.veh_licensePlate }))
    }
    if (mode === "edit" && data) {
      setVehicule({
        ...data,
        veh_version: data.veh_version ?? "",
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
    if (!vehicule.veh_clientId) {
      setAgences([])
      setVehicule((prev) => ({ ...prev, veh_baseId: "" }))
      return
    }

    setLoadingAgences(true)
    getAgences(vehicule.veh_clientId)
      .then((res) => setAgences(res))
      .catch((err) => console.error("Erreur agences :", err))
      .finally(() => setLoadingAgences(false))
  }, [vehicule.veh_clientId])

  const handleLookup = async () => {
    if (!vehicule.veh_licensePlate) {
      toast.error("Veuillez saisir une immatriculation")
      return
    }

    try {
      setLookupLoading(true)

      const res = await fetch(`/api/vehicles/lookup/${vehicule.veh_licensePlate}`)
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Erreur lors de la recherche")
      }

      if (!result.found) {
        toast.error("Véhicule introuvable", {
          description: "Vérifiez la plaque ou saisissez les informations manuellement",
        })
        return
      }

      const v = result.data || result.vehicle

      if (!v) {
        toast.error("Aucune donnée exploitable trouvée")
        return
      }

      setVehicule((prev) => ({
        ...prev,
        veh_brandId: v.brandId ?? prev.veh_brandId,
        veh_year: v.year ?? prev.veh_year,
        veh_energy: v.energy ?? prev.veh_energy,
        veh_doorsCount: v.doorsCount ?? prev.veh_doorsCount,
        veh_bodyType: v.bodyType ?? prev.veh_bodyType,
        veh_color: v.color ?? prev.veh_color,
        veh_realPowerHp: v.realPowerHp ?? prev.veh_realPowerHp,
        veh_fiscalPowerCv: v.fiscalPowerCv ?? prev.veh_fiscalPowerCv,
        veh_gearboxType: v.gearboxType ?? prev.veh_gearboxType,
        veh_kilometrage: v.kilometrage ?? prev.veh_kilometrage,
        veh_firstRegistrationDate: v.firstRegistrationDate
          ? new Date(v.firstRegistrationDate).toISOString()
          : prev.veh_firstRegistrationDate,
        veh_registrationCardDate: v.registrationCardDate
          ? new Date(v.registrationCardDate).toISOString()
          : prev.veh_registrationCardDate,
        veh_version: v.version ?? prev.veh_version,
      }))

      await new Promise((r) => setTimeout(r, 0))

      setVehicule((prev) => ({
        ...prev,
        veh_modelId: v.modelId ?? prev.veh_modelId,
      }))

      toast.success("Véhicule trouvé et pré-rempli")

    } catch (err: any) {
      console.error("Erreur lookup véhicule :", err)

      toast.error("Erreur lors de la recherche", {
        description: err.message || "Veuillez réessayer",
      })

    } finally {
      setLookupLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicule.veh_brandId) return alert("Veuillez sélectionner une marque")
    if (!vehicule.veh_modelId) return alert("Veuillez sélectionner un modèle")
    if (!vehicule.veh_clientId) return alert("Veuillez sélectionner un client")
    if (!vehicule.veh_baseId) return alert("Veuillez sélectionner une agence")
    if (!vehicule.veh_licensePlate) return alert("Veuillez saisir l'immatriculation")
    if(!vehicule.veh_kilometrage) return alert("Veuillez saisir le kilométrage")
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
            disabled
            id="immatriculation"
            placeholder="AA-123-BB"
            className="h-12"
            value={formatLicensePlate(vehicule.veh_licensePlate || "")}
            onChange={(e) => {
              const normalized = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")

              setVehicule({
                ...vehicule,
                veh_licensePlate: normalized
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
          <Label htmlFor="marque">Marque <span className="text-red-500">*</span></Label>
          <BrandSelect
            value={vehicule.veh_brandId ?? null}
            onChange={(brandId) =>
              setVehicule({
                ...vehicule,
                veh_brandId : brandId,
                veh_modelId: null, // reset modèle
              })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="modele">Modèle <span className="text-red-500">*</span></Label>
          <ModelSelect
            key={vehicule.veh_brandId}
            brandId={vehicule.veh_brandId ?? null}
            value={vehicule.veh_modelId ?? null}
            onChange={(modelId) =>
              setVehicule({
                ...vehicule,
                veh_modelId : modelId,
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
            value={vehicule.veh_year ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                veh_year: e.target.value ? Number(e.target.value) : undefined,
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
            value={vehicule.veh_color || ""}
            onChange={(e) => setVehicule({ ...vehicule, veh_color: e.target.value })}
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
            value={fromISOToDateInput(vehicule.veh_firstRegistrationDate)}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                veh_firstRegistrationDate: e.target.value ? toISODateTime(e.target.value) : undefined,
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
            value={fromISOToDateInput(vehicule.veh_registrationCardDate)}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                veh_registrationCardDate: e.target.value ? toISODateTime(e.target.value) : undefined,
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
            value={(vehicule.veh_energy as string) || ""}
            onValueChange={(energy) => setVehicule({ ...vehicule, veh_energy: energy as any })}
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
            value={(vehicule.veh_bodyType as string) || ""}
            onValueChange={(bodyType) =>
              setVehicule({ ...vehicule, veh_bodyType: bodyType as any })
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
            value={vehicule.veh_doorsCount ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                veh_doorsCount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Type de boîte</Label>
          <Select
            value={(vehicule.veh_gearboxType as string) || ""}
            onValueChange={(gearboxType) =>
              setVehicule({ ...vehicule, veh_gearboxType: gearboxType as any })
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
            value={vehicule.veh_realPowerHp ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                veh_realPowerHp: e.target.value ? Number(e.target.value) : undefined,
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
            value={vehicule.veh_fiscalPowerCv ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                veh_fiscalPowerCv: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="kilometrage">Kilométrage <span className="text-red-500">*</span></Label>
          <Input
            id="kilometrage"
            type="number"
            placeholder="220"
            className="h-12"
            value={vehicule.veh_kilometrage ?? ""}
            onChange={(e) =>
              setVehicule({
                ...vehicule,
                veh_kilometrage: e.target.value ? String(e.target.value) : undefined,
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
          value={vehicule.veh_version || ""}
          onChange={(e) => setVehicule({ ...vehicule, veh_version: e.target.value })}
        />
      </div>

      {/* Client */}
      <div className="flex flex-col gap-2">
        <Label>
          Client <span className="text-red-500">*</span>
        </Label>
        <Select
          value={vehicule.veh_clientId || ""}
          onValueChange={(clientId) =>
            setVehicule({ ...vehicule, veh_clientId : clientId, veh_baseId: "" })
          }
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder={loadingClients ? "Chargement..." : "Sélectionnez un client"} />
          </SelectTrigger>
          <SelectContent className="z-[2000]">
            {clients.map((c) => (
              <SelectItem key={c.cli_id} value={c.cli_id}>
                {c.cli_name}
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
          value={vehicule.veh_baseId || ""}
          onValueChange={(baseId) => setVehicule({ ...vehicule, veh_baseId : baseId })}
          disabled={!vehicule.veh_clientId || loadingAgences}
        >
          <SelectTrigger className="h-12">
            <SelectValue
              placeholder={
                !vehicule.veh_clientId
                  ? "Sélectionnez un client d'abord"
                  : loadingAgences
                    ? "Chargement..."
                    : "Sélectionnez une agence"
              }
            />
          </SelectTrigger>
          <SelectContent className="z-[2000]">
            {agences.map((b) => (
              <SelectItem key={b.bas_id} value={b.bas_id}>
                {b.bas_location}
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
