"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";
import { compressImage } from "@/src/utils/image-compression";

const MAX_PHOTOS = 6;

type WizardStep = "idle" | "review" | "analyzing";

type AnalyzeResponse = {
  plate: string | null;
  plateConfidence: "high" | "low" | "none";
  matchedVehicle: any | null;
  aiSummary: { damageDescription: string; interventionSummary: string };
};

type PhotoInterventionWizardProps = {
  onVehicleMatched: (vehicle: any, photos: File[], description: string) => void;
  onVehicleNeedsCreation: (plate: string | null, photos: File[], description: string) => void;
};

export function PhotoInterventionWizard({
  onVehicleMatched,
  onVehicleNeedsCreation,
}: PhotoInterventionWizardProps) {
  const [step, setStep] = useState<WizardStep>("idle");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const revokePreviews = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
  };

  const resetWizard = () => {
    revokePreviews();
    setPhotos([]);
    setPreviews([]);
    setStep("idle");
  };

  const handleOpenCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length < files.length) {
      toast.error("Seules les images sont acceptées");
    }
    if (!validFiles.length) return;

    if (photos.length + validFiles.length > MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos par intervention`);
    }
    const accepted = validFiles.slice(0, Math.max(0, MAX_PHOTOS - photos.length));
    if (!accepted.length) return;

    try {
      const compressed = await Promise.all(accepted.map((f) => compressImage(f)));
      const newPreviews = compressed.map((f) => URL.createObjectURL(f));

      setPhotos((prev) => [...prev, ...compressed]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      setStep("review");
    } catch (err) {
      console.error("Erreur compression photos:", err);
      toast.error("Une erreur est survenue lors du traitement des photos");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    resetWizard();
  };

  const handleAnalyze = async () => {
    if (!photos.length) return;

    setStep("analyzing");

    try {
      const fd = new FormData();
      photos.forEach((f) => fd.append("photos", f));

      const res = await fetch("/api/interventions/analyze-photos", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      const data: AnalyzeResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de l'analyse des photos");
      }

      const description = [data.aiSummary?.interventionSummary, data.aiSummary?.damageDescription]
        .filter(Boolean)
        .join(" ");

      const finalPhotos = photos;
      revokePreviews();
      setPhotos([]);
      setPreviews([]);
      setStep("idle");

      if (data.matchedVehicle) {
        onVehicleMatched(data.matchedVehicle, finalPhotos, description);
      } else {
        onVehicleNeedsCreation(data.plate, finalPhotos, description);
      }
    } catch (err: any) {
      toast.error("Analyse IA", { description: err?.message || "Veuillez réessayer" });
      setStep("review");
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleOpenCapture}
        title="Créer une intervention à partir de photos"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Modal
        open={step === "review" || step === "analyzing"}
        onClose={step === "analyzing" ? () => {} : handleCancel}
        modalTitle="Photos de l'intervention"
        modalDescription="Vérifiez les photos avant de lancer l'analyse IA"
      >
        <div className="space-y-6 p-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((src, index) => (
              <div className="relative" key={src}>
                <Image
                  src={src}
                  alt={`photo-${index}`}
                  width={160}
                  height={160}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                {step === "review" && (
                  <Button
                    type="button"
                    className="absolute top-2 right-2 text-[10px] rounded-full w-8 h-8 bg-red-200 hover:bg-red-300"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    X
                  </Button>
                )}
              </div>
            ))}
          </div>

          {step === "analyzing" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-sm text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              Analyse des photos en cours...
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button type="button" variant="outline" onClick={handleOpenCapture}>
                Ajouter d'autres photos
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button type="button" onClick={handleAnalyze} disabled={!photos.length}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Valider et analyser
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
