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
}

export function UserForm({
  value,
  mode,
  onChange,
  onSubmit,
  onClose,
}: UserFormProps) {
  const roles = [
    { id: "ADMIN", name: "Administrateur" },
    { id: "MANAGER", name: "Gestionnaire" },
    { id: "MECHANIC", name: "Mécanicien" },
    { id: "CLIENT", name: "Client" },
  ]

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

      {/* 🔐 MOT DE PASSE */}
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
          onChange={(e) =>
            onChange({ ...value, password: e.target.value })
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          Le mot de passe est automatiquement chiffré (bcrypt) lors de l’enregistrement.
        </p>
      </div>

      <div>
        <Label>Rôle</Label>
        <Select
          value={value.role || ""}
          onValueChange={(role) => onChange({ ...value, role })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Sélectionnez un rôle" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">
          {mode === "create" ? "Créer" : "Modifier"}
        </Button>
      </div>
    </form>
  )
}
