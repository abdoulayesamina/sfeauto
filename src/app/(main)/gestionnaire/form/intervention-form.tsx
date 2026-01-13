import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group"
import { Textarea } from "@/src/shared/components/ui/textarea"
import { useState } from "react"

type PiecesCommande = "oui" | "non"

interface InterventionFormProps {
  vehicleDisplayText: string // juste pour affichage
  defaultAccordNumber?: string
  onSubmit?: (data: any) => void
  onClose?: () => void
  loading?: boolean
}

export function InterventionForm({
  vehicleDisplayText,
  defaultAccordNumber = "ACC-2026-001",
  onSubmit,
  onClose,
  loading = false,
}: InterventionFormProps) {
  const [piecesCommande, setPiecesCommande] = useState<PiecesCommande>("non")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())
    onSubmit?.(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-screen overflow-y-auto p-4">
      {/* Véhicule affichage seulement */}
      <div className="space-y-2">
        <Label>Véhicule</Label>
        <Input
          name="vehiculeDisplay"
          value={vehicleDisplayText}
          className="h-15"
          readOnly
        />
      </div>

      <div className="space-y-2">
        <Label>Description des travaux</Label>
        <Textarea
          name="descriptionTravaux"
          placeholder="Décrivez les travaux à effectuer..."
          className="min-h-[120px]"
        />
      </div>


      <div className="space-y-3">
        <Label>Pièces commandées</Label>
        <RadioGroup
          value={piecesCommande}
          onValueChange={(value) => setPiecesCommande(value as PiecesCommande)}
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
      </div>

      <div className="border-t pt-6 space-y-6">
        <div className="space-y-2">
          <Label>Numéro d’accord *</Label>
          <Input
            name="numeroAccord"
            className="h-15"
            defaultValue={defaultAccordNumber}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Date de confirmation *</Label>
          <Input
            name="dateConfirmation"
            type="date"
            className="h-15"
            required
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer l’intervention"}
        </Button>
      </div>
    </form>
  )
}
