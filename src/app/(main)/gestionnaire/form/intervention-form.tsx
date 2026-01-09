import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group"
import { Textarea } from "@/src/shared/components/ui/textarea"
import { useState } from "react"

type PiecesCommande = "oui" | "non"

interface InterventionFormProps {
  defaultAccordNumber?: string
  onSubmit?: (data: any) => void
  onClose?: (data: any) => void
}

export function InterventionForm({
  defaultAccordNumber = "ACC-2025-001",
  onSubmit,
  onClose,
}: InterventionFormProps) {
  const [piecesCommande, setPiecesCommande] = useState<PiecesCommande>("non")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())

    onSubmit?.(data)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 p-4"
    >
      <div className="space-y-2">
        <Label>Véhicule *</Label>
        <Input
          name="vehicule"
          className="h-15"
          defaultValue="FDGHHKJJKHJGFDD - test test"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description des travaux</Label>
        <Textarea
          name="descriptionTravaux"
          placeholder="Décrivez les travaux à effectuer..."
          className="min-h-[120px]"
        />
        <p className="text-sm text-muted-foreground">
          Décrivez les réparations nécessaires. Cette information sera visible
          par le mécanicien et le client.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Pièces commandées</Label>
        <RadioGroup
          value={piecesCommande}
          onValueChange={(value) =>
            setPiecesCommande(value as PiecesCommande)
          }
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="non" id="pieces-non" />
            <Label htmlFor="pieces-non">Non</Label>
          </div>

          <div className="flex items-center gap-2">
            <RadioGroupItem value="oui" id="pieces-oui" />
            <Label htmlFor="pieces-oui">Oui</Label>
          </div>
        </RadioGroup>
      </div>

      {piecesCommande === "oui" && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <Label>Détails de la commande</Label>
          <Textarea
            name="detailsCommande"
            placeholder="Listez les pièces commandées..."
            className="min-h-[120px]"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Commentaires</Label>
        <Textarea
          name="commentaires"
          placeholder="Notes ou commentaires supplémentaires..."
          className="min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          Ces commentaires seront visibles par le client. Restez professionnel.
        </p>
      </div>

      <div className="border-t pt-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg">
            Informations de confirmation (Obligatoire)
          </h3>
          <p className="text-sm text-muted-foreground">
            L’intervention sera immédiatement visible par le mécanicien une
            fois créée.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Numéro d’accord *</Label>
          <Input
            name="numeroAccord"
            className="h-15"
            defaultValue={defaultAccordNumber}
            required
          />
          <p className="text-sm text-muted-foreground">
            Numéro reçu par email pour cette intervention
          </p>
        </div>

        <div className="space-y-2">
          <Label>Date de confirmation *</Label>
          <Input
            name="dateConfirmation"
            type="date"
            className="h-15"
            required
          />
          <p className="text-sm text-muted-foreground">
            Date de réception de l’accord par email
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
            Annuler
        </Button>
        <Button type="submit">Créer l’intervention</Button>
      </div>
    </form>
  )
}