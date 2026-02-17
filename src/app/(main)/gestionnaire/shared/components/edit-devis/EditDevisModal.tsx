"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";
import { useDevisApi } from "../../../../devis/shared/hooks/useDevisApi.api.ts";

import { ArticleRow, calcTotals, LineRow } from "@/src/utils/devisPricing";
import { TotalsCard } from "./TotalsCard.tsx";
import { VehicleSummaryCard } from "./VehicleSummaryCard.tsx";
import { DevisLineRow } from "./DevisLineRow.tsx";

type Props = {
  open: boolean;
  onClose: () => void;
  devis: any;
  onUpdated?: (devis: any) => void;
};

export function EditDevisModal({ open, onClose, devis, onUpdated }: Props) {
  const { patchDevis, loading, error } = useDevisApi();

  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [fetching, setFetching] = useState(false);
  const [devTva, setDevTva] = useState<number>(20);
  const [lines, setLines] = useState<LineRow[]>([{ art_id: 0, quantite: 1, reference: "" }]);

  useEffect(() => {
    if (!open) return;
    let alive = true;

    (async () => {
      setFetching(true);
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        if (!alive) return;
        setArticles(Array.isArray(data?.articles) ? data.articles : []);
      } catch {
        if (!alive) return;
        setArticles([]);
      } finally {
        if (!alive) return;
        setFetching(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !devis) return;

    setDevTva(Number(devis?.dev_tva ?? 20));

    const existing = Array.isArray(devis?.articles) ? devis.articles : [];
    setLines(
      existing.length
        ? existing.map((a: any) => ({
            art_id: Number(a.dea_art_id ?? 0),
            quantite: Number(a.dea_quantite ?? 1),
            reference: String(a.dea_art_reference ?? ""),
          }))
        : [{ art_id: 0, quantite: 1, reference: "" }]
    );
  }, [open, devis]);

  const canSubmit = useMemo(() => {
    if (!devis?.dev_id) return false;
    if (!lines.length) return false;
    return lines.every((l) => l.art_id > 0 && l.quantite > 0);
  }, [devis?.dev_id, lines]);

  const { totalHT, totalTTC } = useMemo(() => {
    return calcTotals(lines, articles, devTva);
  }, [lines, articles, devTva]);

  const addLine = () => setLines((p) => [...p, { art_id: 0, quantite: 1, reference: "" }]);
  const removeLine = (idx: number) => setLines((p) => (p.length === 1 ? p : p.filter((_, i) => i !== idx)));
  const updateLine = (idx: number, patch: Partial<LineRow>) =>
    setLines((p) => p.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  async function handleSave() {
    if (!canSubmit) return;

    const payload = {
      dev_tva: devTva,
      items: lines.map((l) => ({
        art_id: l.art_id,
        quantite: l.quantite,
        reference: l.reference?.trim() || null,
      })),
    };

    const res = await patchDevis(Number(devis.dev_id), payload as any);
    if (res?.ok) {
      onUpdated?.(res.data?.devis ?? res.data);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} modalDescription="Modifier le devis">
      <div className="space-y-4 w-[95vw] max-w-[820px]">
        <VehicleSummaryCard devis={devis} />

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
              <Button onClick={handleSave} disabled={!canSubmit || loading}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
