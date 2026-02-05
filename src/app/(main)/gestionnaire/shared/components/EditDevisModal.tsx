"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";
import { useDevisApi } from "../hooks/useDevisApi.api";

type ArticleRow = {
  art_id: number;
  art_name: string;
  art_price: number;
  remises?: {
    rem_pourcentage?: number | null;
    rem_prixremise?: number | null;
  } | null;
};

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

  const [lines, setLines] = useState<Array<{ art_id: number; quantite: number; reference: string }>>([
    { art_id: 0, quantite: 1, reference: "" },
  ]);

  useEffect(() => {
    if (!open) return;

    (async () => {
      setFetching(true);
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        setArticles(data?.articles ?? []);
      } finally {
        setFetching(false);
      }
    })();
  }, [open]);

  // ✅ pré-remplir depuis devis
  useEffect(() => {
    if (!open || !devis) return;

    setDevTva(Number(devis?.dev_tva ?? 20));

    const existing = Array.isArray(devis?.articles) ? devis.articles : [];
    if (existing.length) {
      setLines(
        existing.map((a: any) => ({
          art_id: Number(a.dea_art_id ?? 0),
          quantite: Number(a.dea_quantite ?? 1),
          reference: String(a.dea_art_reference ?? ""),
        }))
      );
    } else {
      setLines([{ art_id: 0, quantite: 1, reference: "" }]);
    }
  }, [open, devis]);

  const canSubmit = useMemo(() => {
    if (!devis?.dev_id) return false;
    if (!lines.length) return false;
    return lines.every((l) => l.art_id > 0 && l.quantite > 0);
  }, [devis?.dev_id, lines]);

  const addLine = () => setLines((p) => [...p, { art_id: 0, quantite: 1, reference: "" }]);
  const removeLine = (idx: number) => setLines((p) => p.filter((_, i) => i !== idx));

  const updateLine = (idx: number, patch: Partial<{ art_id: number; quantite: number; reference: string }>) => {
    setLines((p) => p.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const getRemiseLabel = (art?: ArticleRow) => {
    const r = art?.remises;
    if (!r) return "—";
    if (r.rem_pourcentage != null) return `${r.rem_pourcentage}%`;
    if (r.rem_prixremise != null) return `Prix remisé: ${r.rem_prixremise}`;
    return "—";
  };

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
    if (res.ok) {
      onUpdated?.(res.data?.devis ?? res.data);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} modalDescription="Modifier le devis">
      <div className="space-y-4 md:w-[650px]">
        {fetching ? (
          <p className="text-sm text-zinc-500">Chargement des articles...</p>
        ) : (
          <>
            {/* TVA devis */}
            <div className="space-y-1">
              <label className="text-sm font-medium">TVA du devis (%)</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                type="number"
                min={0}
                value={devTva}
                onChange={(e) => setDevTva(Number(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const art = articles.find((a) => a.art_id === line.art_id);

                return (
                  <div key={idx} className="rounded-lg border p-3 space-y-2">
                    <div className="flex gap-3 items-center">
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        value={line.art_id}
                        onChange={(e) => updateLine(idx, { art_id: Number(e.target.value) })}
                      >
                        <option value={0}>Sélectionner un article</option>
                        {articles.map((a) => (
                          <option key={a.art_id} value={a.art_id}>
                            {a.art_name} — {a.art_price} F
                          </option>
                        ))}
                      </select>

                      <input
                        className="w-[110px] border rounded-md px-3 py-2"
                        type="number"
                        min={1}
                        value={line.quantite}
                        onChange={(e) => updateLine(idx, { quantite: Number(e.target.value) })}
                      />

                      <Button variant="outline" onClick={() => removeLine(idx)} disabled={lines.length === 1}>
                        Suppr
                      </Button>
                    </div>

                    <div className="flex gap-3 items-center">
                      <input
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="Référence (ex: REF-12345)"
                        value={line.reference}
                        onChange={(e) => updateLine(idx, { reference: e.target.value })}
                      />
                      <div className="text-sm text-zinc-600 whitespace-nowrap">
                        Remise: <strong>{getRemiseLabel(art)}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" onClick={addLine}>
              + Ajouter une ligne
            </Button>

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
