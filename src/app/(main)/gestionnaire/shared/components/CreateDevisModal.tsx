"use client";

import { useMemo, useState } from "react";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";
import { useDevisApi } from "../../../devis/shared/hooks/useDevisApi.api";

import { useArticles } from "../hooks/useArticles";
import { calcTotals, LineRow } from "@/src/utils/devisPricing";
import { DevisLineRow } from "./edit-devis/DevisLineRow";
import { TotalsCard } from "./edit-devis/TotalsCard.tsx";


type Props = {
  open: boolean;
  onClose: () => void;
  interventionId: string;
  onCreated?: (devis: any) => void;
};

export function CreateDevisModal({ open, onClose, interventionId, onCreated }: Props) {
  const { createDevis, loading, error } = useDevisApi();
  const { articles, fetching } = useArticles(open);

  const [devTva, setDevTva] = useState<number>(20);
  const [lines, setLines] = useState<LineRow[]>([{ art_id: 0, quantite: 1, reference: "" }]);

  const canSubmit = useMemo(() => {
    if (!interventionId) return false;
    if (!lines.length) return false;
    return lines.every((l) => l.art_id > 0 && l.quantite > 0);
  }, [interventionId, lines]);

  const { totalHT, totalTTC } = useMemo(() => {
    return calcTotals(lines, articles, devTva);
  }, [lines, articles, devTva]);

  const addLine = () => setLines((p) => [...p, { art_id: 0, quantite: 1, reference: "" }]);
  const removeLine = (idx: number) => setLines((p) => (p.length === 1 ? p : p.filter((_, i) => i !== idx)));
  const updateLine = (idx: number, patch: Partial<LineRow>) =>
    setLines((p) => p.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  async function handleCreate() {
    if (!canSubmit) return;

    const payload = {
      interventionId,
      dev_tva: devTva,
      items: lines.map((l) => ({
        art_id: l.art_id,
        quantite: l.quantite,
        reference: l.reference?.trim() || null,
      })),
    };

    const res = await createDevis(payload as any);
    if (res?.ok) {
      onCreated?.(res.data?.devis ?? res.data);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} modalTitle="Créer un devis">
      <div className="space-y-4 w-[95vw] max-w-[820px]">
        {fetching ? (
          <p className="text-sm text-zinc-500">Chargement des articles...</p>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-12 md:col-span-4 space-y-1">
              
              </div>

              <div className="col-span-12 md:col-span-8 flex md:justify-end">
                <Button variant="outline" onClick={addLine}>
                  + Ajouter une ligne
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => (
                <DevisLineRow
                  key={idx}
                  line={line}
                  idx={idx}
                  articles={articles}
                  onChange={updateLine}
                  onRemove={removeLine}
                  disableRemove={lines.length === 1}
                />
              ))}
            </div>

            <TotalsCard totalHT={totalHT} totalTTC={totalTTC} devTva={devTva} />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={!canSubmit || loading}>
                {loading ? "Création..." : "Créer le devis"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
