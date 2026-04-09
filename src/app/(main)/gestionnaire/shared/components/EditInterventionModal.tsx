"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Modal } from "@/src/shared/components/modal";

import { InterventionPatchPayload, useInterventionApi } from "../hooks/useInterventionApi.api";
import { useInterventionPhotos } from "../hooks/useInterventionPhotos.api";
import { toast } from "sonner";


type PiecesCommande = "oui" | "non";

type Props = {
  open: boolean;
  onClose: () => void;
  intervention: any;
  onUpdated?: (updatedIntervention: any) => void;
  reloadInterventionList?: () => void;
};

function toDateInputValue(d?: string | Date | null) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function EditInterventionModal({ open, onClose, intervention, onUpdated, reloadInterventionList }: Props) {
  const { patchIntervention, loading } = useInterventionApi();

  const { photos, loading: photosLoading, error: photosError, refetch } =
    useInterventionPhotos(intervention?.int_id);


  const [piecesCommande, setPiecesCommande] = useState<PiecesCommande>("non");

  const [workDescription, setWorkDescription] = useState("");
  const [ordersDetails, setOrdersDetails] = useState("");
  const [comments, setComments] = useState("");

  const [accordNumber, setAccordNumber] = useState("");
  const [dateOfConfirmation, setDateOfConfirmation] = useState("");

  const [imagesBlob, setImagesBlob] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (!open || !intervention) return;

    // setWorkDescription(intervention.int_workDescription);
    setWorkDescription(intervention.int_workDescription ?? "");
    setAccordNumber(intervention.int_accordNumber ?? "");
    setDateOfConfirmation(toDateInputValue(intervention.int_dateOfConfirmation));

    const didOrder = Boolean(intervention.int_didOrderParts);
    setPiecesCommande(didOrder ? "oui" : "non");

    setOrdersDetails(intervention.int_ordersDetails ?? "");
    setComments(intervention.int_comments ?? "");

    setImages([]);
    setImagesBlob([]);


  }, [open, intervention]);


  useEffect(() => {
    if (open && intervention?.int_id) {
      refetch()
    }
  }, [open, intervention?.int_id])


  const canSave = useMemo(() => Boolean(intervention?.int_id), [intervention?.int_id]);

  //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files) return

  //   const files = Array.from(e.target.files)

  //   // 🔥 Ajouter au lieu de remplacer
  //   setImages(prev => [...prev, ...files])

  //   const previews = files.map(file => URL.createObjectURL(file))
  //   setImagesBlob(prev => [...prev, ...previews])

  //   e.target.value = ""
  // }

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files) return;

  //   const files = Array.from(e.target.files);

  //   const allowedTypes = ["image/png", "image/jpeg"];
  //   const maxSize = 5 * 1024 * 1024; // 5MB

  //   const validFiles: File[] = [];

  //   let hasTypeError = false;
  //   let hasSizeError = false;

  //   for (let file of files) {
  //     if (!allowedTypes.includes(file.type)) {
  //       hasTypeError = true;
  //       continue;
  //     }

  //     if (file.size > maxSize) {
  //       hasSizeError = true;
  //       continue;
  //     }

  //     validFiles.push(file);
  //   }

  //   // 🔥 TOASTS
  //   if (hasTypeError) {
  //     toast.error("Certains fichiers ont été ignorés (formats autorisés : PNG, JPEG)");
  //   }

  //   if (hasSizeError) {
  //     toast.error("Certains fichiers dépassent 5MB");
  //   }

  //   if (validFiles.length === 0) {
  //     e.target.value = "";
  //     return;
  //   }

  //   setImages(prev => [...prev, ...validFiles]);

  //   const previews = validFiles.map(file => URL.createObjectURL(file));
  //   setImagesBlob(prev => [...prev, ...previews]);

  //   e.target.value = "";
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const allowedTypes = ["image/png", "image/jpeg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles: File[] = [];

    let hasTypeError = false;
    let hasSizeError = false;

    for (const file of files) {
      if (!file.type || !allowedTypes.includes(file.type)) {
        hasTypeError = true;
        continue;
      }

      if (file.size > maxSize) {
        hasSizeError = true;
        continue;
      }

      validFiles.push(file);
    }

    if (hasTypeError) {
      toast.error("Formats non supportés détectés", {
        description: "Seuls les fichiers PNG et JPEG sont autorisés",
      });
    }

    if (hasSizeError) {
      toast.error("Fichiers trop volumineux", {
        description: "La taille maximale est de 5MB",
      });
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }


    setImages((prev) => [...prev, ...validFiles]);

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagesBlob((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (!intervention?.int_id) return;

    const didOrderParts = piecesCommande === "oui";

    const payload: InterventionPatchPayload = {
      workDescription: workDescription.trim() || null,
      accordNumber: accordNumber.trim() || null,
      dateOfConfirmation: dateOfConfirmation
        ? new Date(dateOfConfirmation).toISOString()
        : null,
      didOrderParts,
      ordersDetails: didOrderParts ? (ordersDetails.trim() || null) : null,
      comments: comments.trim() || null,
    };

    const res = await patchIntervention(intervention.int_id, payload);

    if (!res.ok) return;


    if (images.length > 0) {
      const formData = new FormData();

      images.forEach((file) => {
        formData.append("files", file);
      });

      await fetch(
        `/api/interventions/${intervention.int_id}/photos`,
        {
          method: "POST",
          body: formData,
        }
      );
    }

    onUpdated?.(res.data?.intervention ?? res.data);
    reloadInterventionList?.();
    onClose();
  }


  return (
    <Modal open={open} onClose={onClose} modalTitle="Modifier l’intervention" >
      <form onSubmit={handleSave} className="space-y-8 p-4 md:w-[650px]">
        {intervention?.vehicle?.licensePlate && (
          <div className="space-y-2">
            <Label>Véhicule</Label>
            <Input value={intervention.vehicle.licensePlate} readOnly className="h-15" />
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label>Description des travaux</Label>
          <Textarea
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            placeholder="Décrivez les travaux à effectuer..."
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Photos déjà liées</Label>

          {photosError ? (
            <p className="text-sm text-red-600">{photosError}</p>
          ) : photosLoading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : !photos?.length ? (
            <p className="text-sm text-gray-500 italic">Aucune photo liée à cette intervention.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((p: any, index: number) => (
                <div key={p.id} className="relative group">
                  <img
                    src={p.sasUrl}
                    alt={`photo-${index}`}
                    className="w-full h-32 object-cover rounded-lg border"
                    loading="lazy"
                  />

                  <Button
                    type="button"
                    size="sm"
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                    onClick={async (e) => {
                      e.stopPropagation()

                      await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/photos/${p.id}`,
                        {
                          method: "DELETE",
                        }
                      )

                      await refetch()
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Ajouter des photos</Label>

          {/* <span
            className="text-sm text-gray-500 border p-2 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => document.getElementById("EditInputImages")?.click()}
          >
            {imagesBlob.length > 0
              ? `${images.length} fichier(s) sélectionné(s)`
              : "Sélectionner des images"}
          </span> */}

          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("EditInputImages")?.click()}
          >
            + Ajouter une photo
          </Button>

          <p className="text-gray-500 text-xs">
            Formats acceptés : PNG, JPEG • Max 5MB
          </p>

          {images.length > 0 && (
            <span className="text-sm text-gray-500">
              {images.length} fichier(s) sélectionné(s)
            </span>
          )}

          <Input
            id="EditInputImages"
            type="file"
            className="cursor-pointer hidden"
            // accept="image/*"
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
                    setImages((prev) => prev.filter((_, i) => i !== index));
                    setImagesBlob((prev) => prev.filter((_, i) => i !== index));
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

        {/* Pièces commandées (RadioGroup comme création) */}
        <div className="space-y-3">
          <Label>Pièces commandées</Label>
          <RadioGroup
            value={piecesCommande}
            onValueChange={(value) => setPiecesCommande(value as PiecesCommande)}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="non" id="edit-pieces-non" />
              <Label htmlFor="edit-pieces-non">Non</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="oui" id="edit-pieces-oui" />
              <Label htmlFor="edit-pieces-oui">Oui</Label>
            </div>
          </RadioGroup>
        </div>

        {piecesCommande === "oui" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <Label>Détails de la commande</Label>
            <Textarea
              value={ordersDetails}
              onChange={(e) => setOrdersDetails(e.target.value)}
              placeholder="Listez les pièces commandées..."
              className="min-h-[120px]"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Commentaires</Label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Notes ou commentaires supplémentaires..."
            className="min-h-[100px]"
          />
        </div>

        {/* Accord / date (même style création) */}
        <div className="border-t pt-6 space-y-6">
          <div className="space-y-2">
            <Label>Numéro d’accord</Label>
            <Input
              className="h-15"
              value={accordNumber}
              onChange={(e) => setAccordNumber(e.target.value)}
              placeholder="ACC-2026-001"
            />
          </div>

          <div className="space-y-2">
            <Label>Date de confirmation</Label>
            <Input
              type="date"
              className="h-15"
              value={dateOfConfirmation}
              onChange={(e) => setDateOfConfirmation(e.target.value)}
            />
          </div>
        </div>

        {photosError && <p className="text-sm text-red-600">{photosError}</p>}
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={!canSave || loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
