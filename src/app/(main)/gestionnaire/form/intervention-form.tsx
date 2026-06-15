"use client";

import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { formatDateToISO } from "@/src/utils/formatters";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { compressImage } from "@/src/utils/image-compression";

type PiecesCommande = "oui" | "non";

interface InterventionFormProps {
  vehicleId: string
  vehicleDisplayText: string
  kilometrage: string
  defaultAccordNumber?: string
  onSubmit?: (data: any) => void
  onClose?: () => void
  loading?: boolean
}

export function InterventionForm({
  kilometrage,
  vehicleId,
  vehicleDisplayText,
  defaultAccordNumber = "ACC-2026-001",
  onSubmit,
  onClose,
  loading = false,
}: InterventionFormProps) {
  const [piecesCommande, setPiecesCommande] =
    useState<PiecesCommande>("non");

  const [imagesBlob, setImagesBlob] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  // ✅ champs contrôlés
  const [description, setDescription] = useState("");
  const [numeroAccord, setNumeroAccord] = useState("");
  const [dateConfirmation, setDateConfirmation] = useState("");
  const [detailsCommande, setDetailsCommande] = useState("");
  const [commentaires, setCommentaires] = useState("");
  const [mileage, setMileage] = useState(kilometrage);

  // 🔥 ref pour focus auto
  const accordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("Images selected:", imagesBlob);
  }, [imagesBlob]);

  // 🔥 focus automatique si champ rempli (ou après erreur)
  useEffect(() => {
    if (numeroAccord && accordRef.current) {
      accordRef.current.focus();
    }
  }, [numeroAccord]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedTypes = ["image/png", "image/jpeg"];
    // On ne bloque plus par la taille ici, on compresse
    const validFiles: File[] = [];
    let hasTypeError = false;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        hasTypeError = true;
        continue;
      }
      validFiles.push(file);
    }

    if (hasTypeError) {
      toast.error("Format non supporté (PNG / JPEG uniquement)");
    }

    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    try {
      const compressedFiles = await Promise.all(
        validFiles.map((file) => compressImage(file))
      );

      const previews = compressedFiles.map((file) => URL.createObjectURL(file));

      setImages((prev) => [...prev, ...compressedFiles]);
      setImagesBlob((prev) => [...prev, ...previews]);
    } catch (error) {
      console.error("Erreur lors de la compression:", error);
      toast.error("Une erreur est survenue lors du traitement des images");
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit?.({
      descriptionTravaux: description,
      numeroAccord,
      dateConfirmation,
      detailsCommande,
      commentaires,
      piecesCommande,
      images,
      vehicleId,
      kilometrage: mileage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4">
      <div className="space-y-2">
        <Label>Véhicule</Label>
        <Input
          value={vehicleDisplayText}
          className="h-15"
          readOnly
        />
      </div>

      <div className="space-y-2">
        <Label>Description des travaux</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez les travaux à effectuer..."
          className="min-h-[120px]"
        />
      </div>

      <div>
        <div className="bg-gray-100 p-3 rounded-md mb-4 text-[10px]">
          <Label>Kilométrage du véhicule : {kilometrage}</Label>
        </div>
        <div className="space-y-2">
          <Label>Kilométrage de l'intervention</Label>
          <Input
            type="number"
            name="kilometrage"
            value={mileage}
            max={1000000}
            min={0}
            step={1}
            onChange={(e) => setMileage(e.target.value)}
            className="h-15"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Label>Photo</Label>
        <span
          className="text-sm text-gray-500 border p-2 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={() =>
            document.getElementById("InputImages")?.click()
          }
        >
          {imagesBlob.length > 0
            ? `${images.length} fichier(s) sélectionné(s)`
            : "Sélectionner des images PNG/JPEG"}
        </span>

        <Input
          id="InputImages"
          type="file"
          className="hidden"
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
                className="absolute top-2 right-2 text-[10px] rounded-full w-8 h-8 bg-red-200 hover:bg-red-300"
                onClick={() => {
                  setImages((prev) =>
                    prev.filter((_, i) => i !== index)
                  );
                  setImagesBlob((prev) =>
                    prev.filter((_, i) => i !== index)
                  );
                }}
              >
                X
              </Button>
            </div>
          ))
        ) : (
          <span className="text-gray-500 text-sm italic">
            Images
          </span>
        )}
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
        <div className="space-y-2">
          <Label>Détails de la commande</Label>
          <Textarea
            value={detailsCommande}
            onChange={(e) =>
              setDetailsCommande(e.target.value)
            }
            placeholder="Listez les pièces commandées..."
            className="min-h-[120px]"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Commentaires</Label>
        <Textarea
          value={commentaires}
          onChange={(e) =>
            setCommentaires(e.target.value)
          }
          placeholder="Notes ou commentaires supplémentaires..."
          className="min-h-[100px]"
        />
      </div>

      <div className="border-t pt-6 space-y-6">
        <div className="space-y-2">
          <Label>Numéro d’accord</Label>
          <Input
            ref={accordRef}
            value={numeroAccord}
            onChange={(e) =>
              setNumeroAccord(e.target.value)
            }
            className="h-15"
            placeholder={defaultAccordNumber}
          />
        </div>

        <div className="space-y-2">
          <Label>Date de confirmation</Label>
          <Input
            type="date"
            value={dateConfirmation}
            onChange={(e) => {
              setDateConfirmation(formatDateToISO(e.target.value))
              console.log("Date de confirmation:", formatDateToISO(e.target.value))
            }
            }
            className="h-15"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : null}
          {loading ? "Création..." : "Créer l’intervention"}
        </Button>
      </div>
    </form>
  );
}