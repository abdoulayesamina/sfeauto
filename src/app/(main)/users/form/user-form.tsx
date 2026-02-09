"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { User } from "@/src/utils/types/user"

type UserFormProps = {
  value: Partial<User>
  mode: "create" | "edit"
  onChange: (data: Partial<User>) => void
  onSubmit: () => void
  onClose: () => void
  clients: { id: string; name: string }[]
  agences: { id: string; location: string; clientId: string }[]
}

export function UserForm({
  value,
  mode,
  onChange,
  onSubmit,
  onClose,
  clients,
  agences,
}: UserFormProps) {
  const roles = [
    { id: "ADMIN", name: "Administrateur" },
    { id: "MANAGER", name: "Gestionnaire" },
    { id: "MECHANIC", name: "Mécanicien" },
    { id: "CLIENT", name: "Client" },
    { id: "SIEGE", name: "Siège" },
    { id: "AGENCE", name: "Agence" },
  ] as const

  const needsClientAndBase = value.role === "CLIENT" || value.role === "AGENCE"

  const filteredAgences = value.clientId
    ? agences.filter((a) => a.clientId === value.clientId)
    : []

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-4"
    >
      <div>
        <Label>Nom</Label>
        <Input
          className="h-12"
          value={value.name || ""}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          className="h-12"
          value={value.email || ""}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
      </div>

      <div>
        <Label>Mot de passe</Label>
        <Input
          className="h-12"
          type="password"
          value={value.password || ""}
          placeholder={
            mode === "edit"
              ? "Mot de passe (laisser vide pour ne pas changer)"
              : "Mot de passe"
          }
          onChange={(e) => onChange({ ...value, password: e.target.value })}
        />
      </div>

      <div>
        <Label>Rôle</Label>
        <Select
          value={value.role || ""}
          onValueChange={(role) => {
            // Quand on change de rôle, on reset les champs qui ne s'appliquent plus
            const next: Partial<User> = { ...value, role }

            const willNeed = role === "CLIENT" || role === "AGENCE"
            if (!willNeed) {
              next.clientId = null
              next.baseId = null
            }

            onChange(next)
          }}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Sélectionnez un rôle" />
          </SelectTrigger>
          <SelectContent className="z-[2000]">
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CLIENT + AGENCE: choisir client + base */}
      {needsClientAndBase && (
        <>
          <div>
            <Label>Client</Label>
            <Select
              value={value.clientId || ""}
              onValueChange={(clientId) =>
                onChange({
                  ...value,
                  clientId,
                  baseId: null, // reset base quand client change
                })
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionnez un client" />
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

          <div>
            <Label>Agence</Label>
            <Select
              value={value.baseId || ""}
              onValueChange={(baseId) => onChange({ ...value, baseId })}
              disabled={!value.clientId}
            >
              <SelectTrigger className="h-12">
                <SelectValue
                  placeholder={
                    value.clientId
                      ? "Sélectionnez une agence"
                      : "Choisissez d'abord un client"
                  }
                />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {filteredAgences.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Message d'aide spécifique */}
            {value.role === "AGENCE" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Pour un compte <b>Agence</b>, l’agence (base) doit être sélectionnée.
              </p>
            )}
          </div>
        </>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={
            // Petit guard UI: si AGENCE => base obligatoire
            value.role === "AGENCE" && (!value.clientId || !value.baseId)
          }
        >
          {mode === "create" ? "Créer" : "Modifier"}
        </Button>
      </div>
    </form>
  )
}
