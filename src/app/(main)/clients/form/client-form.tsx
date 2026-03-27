"use client"

import { Spinner } from "@/src/shared/components/spinner"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Textarea } from "@/src/shared/components/ui/textarea"
import { Client } from "@/src/utils/types/client"
import { useEffect, useRef } from "react"

type Props = {
  mode: "create" | "edit"
  data: Partial<Client>
  loading?: boolean
  onClose: () => void
  onSubmit: () => void
  onChange: (data: Partial<Client>) => void
}

export function ClientForm({
  mode,
  data,
  onClose,
  onSubmit,
  onChange,
  loading,
}: Props) {

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      inputRef.current?.focus();
  }, [mode]);

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>Nom du client</Label>
          <Input
            ref={inputRef}
            className="h-12"
            value={data.cli_name || ""}
            onChange={(e) => onChange({ ...data, cli_name: e.target.value })}
            placeholder="Nom du client"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input
            className="h-12"
            type="email"
            value={data.cli_email || ""}
            onChange={(e) => onChange({ ...data, cli_email: e.target.value })}
            placeholder="email@exemple.com"
          />
        </div>

        <div>
          <Label>Téléphone</Label>
          <Input
            className="h-12"
            value={data.cli_phone || ""}
            onChange={(e) => onChange({ ...data, cli_phone: e.target.value })}
            placeholder="+223 xx xx xx xx"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Numéro client</Label>
          <Input
            className="h-12"
            value={data.cli_numClient || ""}
            onChange={(e) => onChange({ ...data, cli_numClient: e.target.value })}
            placeholder="CLI-0001"
          />
        </div>

        <div>
          <Label>TVA intracommunautaire</Label>
          <Input
            className="h-12"
            value={data.cli_tvaIntraCommunautaire || ""}
            onChange={(e) =>
              onChange({ ...data, cli_tvaIntraCommunautaire: e.target.value })
            }
            placeholder="FRXX999999999"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>Adresse de facturation</Label>
          <Textarea
            className="h-24"                    // mieux que h-12 pour une adresse
            value={data.cli_adresseFacturation || ""}
            onChange={(e) =>
              onChange({ ...data, cli_adresseFacturation: e.target.value })
            }
            placeholder="Adresse complète de facturation"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="button" onClick={onSubmit} disabled={loading}>
          <span className="flex items-center gap-2">
            {loading ? <Spinner className="size-4" /> : ""}
            {mode === "create" ? "Créer le client" : "Modifier le client"}
          </span>
        </Button>
      </div>
    </form>
  )
}
