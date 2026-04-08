import { Spinner } from "@/src/shared/components/spinner"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group"
import { Textarea } from "@/src/shared/components/ui/textarea"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type PiecesCommande = "oui" | "non"

interface InterventionFormProps {
  vehicleId: string
  vehicleDisplayText: string
  defaultAccordNumber?: string
  onSubmit?: (data: any) => void
  onClose?: () => void
  loading?: boolean
}

export function InterventionForm({
  vehicleId,
  vehicleDisplayText,
  defaultAccordNumber = "ACC-2026-001",
  onSubmit,
  onClose,
  loading = false,
}: InterventionFormProps) {
  const [piecesCommande, setPiecesCommande] = useState<PiecesCommande>("non")
  const [imagesBlob, setImagesBlob] = useState<string[]>([])
  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    console.log("Images selected:", imagesBlob)
  }, [imagesBlob])

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files) return

  //   const files = Array.from(e.target.files)
  //   setImages(files)

  //   const previews = files.map((file) => URL.createObjectURL(file))
  //   setImagesBlob(previews)
  // }

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || [])
  //   if (!files.length) return

  //   const previews = files.map(file => URL.createObjectURL(file))

  //   setImages(prev => [...prev, ...files])          // File[]
  //   setImagesBlob(prev => [...prev, ...previews])  // string[]
  // }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const allowedTypes = ["image/png", "image/jpeg"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    const validFiles: File[] = []

    let hasTypeError = false
    let hasSizeError = false

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        hasTypeError = true
        continue
      }

      if (file.size > maxSize) {
        hasSizeError = true
        continue
      }

      validFiles.push(file)
    }

    // 🔥 messages
    if (hasTypeError) {
      toast.error("Format non supporté (PNG / JPEG uniquement)")
    }

    if (hasSizeError) {
      toast.error("Certains fichiers dépassent 5MB")
    }

    if (!validFiles.length) return

    const previews = validFiles.map(file => URL.createObjectURL(file))

    setImages(prev => [...prev, ...validFiles])
    setImagesBlob(prev => [...prev, ...previews])
  }



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())
 
    onSubmit?.({
      ...data,
      vehicleId,
      piecesCommande,
      images,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4">
      <input type="hidden" name="vehicleId" value={vehicleId} />
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

      <div className="flex flex-col space-y-2">
        <Label>Photo</Label>
        <span
          className="text-sm text-gray-500 border p-2 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={() => {
            document.getElementById("InputImages")?.click()
          }}
        >
          {imagesBlob.length > 0
            ? `${images.length} fichier(s) sélectionné(s)`
            : "Sélectionner des images au format PNG ou JPEG . Max 5 Mo"}
        </span>

        <Input
          id="InputImages"
          type="file"
          name="photoTravaux"
          className="cursor-pointer hidden"
          accept="image/png, image/jpeg"
          multiple
          onChange={handleFileChange}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {imagesBlob.length > 0 ? (
          imagesBlob.map((src, index) => (
            <div className="relative" key={index}>
              <Image
                src={src}
                alt={`preview-${index}`}
                width={128}
                height={128}
                className="w-full h-32 object-cover rounded-lg border"
                onClick={() => window.open(src, "_blank")}
              />
              <Button
                type="button"
                className="font-bold shadow-2xl bg-red-200 hover:bg-red-300 absolute top-2 right-2 text-black text-[10px] rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => {
                  setImages((prev) => prev.filter((_, i) => i !== index))
                  setImagesBlob((prev) => prev.filter((_, i) => i !== index))
                }}
              >
                X
              </Button>
            </div>
          ))
        ) : (
          <span className="text-gray-500 text-sm italic">Images</span>
        )}
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
          <Label>Numéro d’accord</Label>
          <Input
            name="numeroAccord"
            className="h-15"
            placeholder={defaultAccordNumber}
          />

        </div>

        <div className="space-y-2">
          <Label>Date de confirmation</Label>
          <Input
            name="dateConfirmation"
            type="date"
            className="h-15"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : ""}
          {loading ? "Création..." : "Créer l’intervention"}
        </Button>
      </div>
    </form>
  )
}
