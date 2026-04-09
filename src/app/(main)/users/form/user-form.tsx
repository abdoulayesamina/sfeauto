"use client"

import { Spinner } from "@/src/shared/components/spinner"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { User } from "@/src/utils/types/user"
import { useEffect, useRef } from "react"


type UserFormProps = {
  value: Partial<User>
  mode: "create" | "edit"
  loading?: boolean
  onChange: (data: Partial<User>) => void
  onSubmit: () => void
  onClose: () => void
  clients: { cli_id: string; cli_name: string }[]
  agences: { bas_id: string; bas_location: string; bas_clientId: string }[]
}


export function UserForm({
  value,
  mode,
  onChange,
  onSubmit,
  onClose,
  clients,
  agences,
  loading,
}: UserFormProps) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const roles = [
    { id: "ADMIN", name: "Administrateur" },
    { id: "MANAGER", name: "Gestionnaire" },
    { id: "MECHANIC", name: "Mécanicien" },
    { id: "CLIENT", name: "Client" },
    { id: "SIEGE", name: "Siège" },
    { id: "AGENCE", name: "Agence" },
  ] as const

  const needsClientAndBase = value.usr_role === "CLIENT" || value.usr_role === "AGENCE"
  const filteredAgences = value.usr_clientId
    ? agences.filter((a) => a.bas_clientId === value.usr_clientId)
    : []

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const password = value.usr_password || "";

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passwordsMatch = password === confirmPassword;

  const isPasswordValid =
    Object.values(passwordRules).every(Boolean) && passwordsMatch;

  const isChangingPassword = oldPassword.trim().length > 0;
  const newPasswordsMatch = newPassword === confirmNewPassword;

  return (
    <form
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-4"
    >
      <div>
        <Label>Nom</Label>
        <Input
          ref={inputRef}
          className="h-12"
          value={value.usr_name || ""}
          onChange={(e) => onChange({ ...value, usr_name: e.target.value })}
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          className="h-12"
          autoComplete="off"
          value={value.usr_email || ""}
          onChange={(e) => onChange({ ...value, usr_email: e.target.value })}
        />
      </div>


      {mode === "create" ? (
        <>
          <div>
            <Label>Mot de passe</Label>
            <Input
              className="h-12"
              type="password"
              autoComplete="new-password"
              value={value.usr_password || ""}
              placeholder="Mot de passe"
              onChange={(e) => onChange({ ...value, usr_password: e.target.value })}
            />

            <div className="text-sm mt-2 space-y-1">
              <p className={passwordRules.length ? "text-green-500" : "text-red-500"}>• 8 caractères minimum</p>
              <p className={passwordRules.uppercase ? "text-green-500" : "text-red-500"}>• Une majuscule</p>
              <p className={passwordRules.lowercase ? "text-green-500" : "text-red-500"}>• Une minuscule</p>
              <p className={passwordRules.number ? "text-green-500" : "text-red-500"}>• Un chiffre</p>
            </div>
          </div>

          <div>
            <Label>Confirmer le mot de passe</Label>
            <Input
              className="h-12"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-red-500 text-sm mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>
        </>
      ) : (
        // ---------- MODE EDIT ----------
        <>
          <div>
            <Label>Ancien mot de passe</Label>
            <Input
              className="h-12"
              type="password"
              autoComplete="new-password"
              value={oldPassword}
              placeholder="Ancien mot de passe (laisser vide pour ne pas changer)"
              onChange={(e) => {
                const val = e.target.value;
                setOldPassword(val);
                onChange({ ...value, usr_password: val });
              }}
            />
          </div>

          {isChangingPassword && (
            <>
              <div>
                <Label>Nouveau mot de passe</Label>
                <Input
                  className="h-12"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  placeholder="Nouveau mot de passe"
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewPassword(val);
                    onChange({ ...value, newPassword: val });
                  }}
                />


                <div className="text-sm mt-2 space-y-1">
                  <p className={newPassword.length >= 8 ? "text-green-500" : "text-red-500"}>• 8 caractères minimum</p>
                  <p className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-red-500"}>• Une majuscule</p>
                  <p className={/[a-z]/.test(newPassword) ? "text-green-500" : "text-red-500"}>• Une minuscule</p>
                  <p className={/[0-9]/.test(newPassword) ? "text-green-500" : "text-red-500"}>• Un chiffre</p>
                </div>
              </div>

              <div>
                <Label>Confirmer le nouveau mot de passe</Label>
                <Input
                  className="h-12"
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                {confirmNewPassword && !newPasswordsMatch && (
                  <p className="text-red-500 text-sm mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
            </>
          )}
        </>
      )}

      <div>
        <Label>Rôle</Label>
        <Select
          value={value.usr_role || ""}

          onValueChange={(role: "CLIENT" | "AGENCE") => {

            const next: Partial<User> = { ...value, usr_role: role }

            const willNeed = role === "CLIENT" || role === "AGENCE"
            if (!willNeed) {
              next.usr_clientId = null
              next.usr_baseId = null
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
              value={value.usr_clientId || ""}
              onValueChange={(clientId) =>
                onChange({
                  ...value,
                  usr_clientId: clientId,
                  usr_baseId: null,
                })
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionnez un client" />
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

          <div>
            <Label>Agence</Label>
            <Select
              value={value.usr_baseId || ""}
              onValueChange={(baseId) => onChange({ ...value, usr_baseId: baseId })}
              disabled={!value.usr_clientId}
            >
              <SelectTrigger className="h-12">
                <SelectValue
                  placeholder={
                    value.usr_clientId
                      ? "Sélectionnez une agence"
                      : "Choisissez d'abord un client"
                  }
                />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {filteredAgences.map((a) => (
                  <SelectItem key={a.bas_id} value={a.bas_id}>
                    {a.bas_location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Message d'aide spécifique */}
            {value.usr_role === "AGENCE" && (
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
          // disabled={
          //   // Petit guard UI: si AGENCE => base obligatoire
          //   value.role === "AGENCE" && (!value.clientId || !value.baseId) || loading
          // }
          disabled={
            (value.usr_role === "AGENCE" && (!value.usr_clientId || !value.usr_baseId)) ||
            loading ||
            (mode === "create" && !isPasswordValid) ||
            (mode === "edit" &&
              oldPassword.trim().length > 0 &&
              (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword)
            )
          }
        >
          <span className="flex items-center gap-2">
            {loading ? <Spinner /> : ""}
            {mode === "create" ? "Créer" : "Modifier"}
          </span>
        </Button>
      </div>
    </form>
  )
}
