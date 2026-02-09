"use client";

import { useState } from "react";
import { Modal } from "@/src/shared/components/modal";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Spinner } from "@/src/shared/components/spinner";
import { successAlert, errorAlert } from "@/src/lib/alerts";
import { useDevisApi } from "../../../devis/shared/hooks/useDevisApi.api";

type Props = {
  open: boolean;
  onClose: () => void;
  devis: any;
  onValidated: (updated: any) => void;
};

export function ValidateDevisModal({ open, onClose, devis, onValidated }: Props) {
  const { validateDevis, loading } = useDevisApi();
  const [accordNumber, setAccordNumber] = useState("");

  const handleSubmit = async () => {
    if (!accordNumber.trim()) {
      errorAlert("Champ requis", "Veuillez saisir le numéro d’accord client");
      return;
    }

    const res = await validateDevis(devis.dev_id, accordNumber.trim());

    if (!res.ok) {
      errorAlert("Erreur", res.error || "Impossible de valider le devis");
      return;
    }

    successAlert("Devis validé", "Le devis a été validé avec succès");
    onValidated(res.data?.devis ?? res.data);
    setAccordNumber("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      modalTitle="Valider le devis"
      modalDescription="Saisir le numéro d’accord client pour autoriser l’intervention"
    >
      <div className="space-y-4">
        <div>
          <Label>Numéro d’accord</Label>
          <Input
            value={accordNumber}
            onChange={(e) => setAccordNumber(e.target.value)}
            placeholder="Ex: ACC-2026-001"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                Validation...
              </span>
            ) : (
              "Valider le devis"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
