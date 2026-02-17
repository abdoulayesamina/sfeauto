"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { ArticleRow, formatMoney, getRemiseLabel, getUnitHT, LineRow } from "@/src/utils/devisPricing";

type Props = {
  line: LineRow;
  idx: number;
  articles: ArticleRow[];
  onChange: (idx: number, patch: Partial<LineRow>) => void;
  onRemove: (idx: number) => void;
  disableRemove: boolean;
};

export function DevisLineRow({ line, idx, articles, onChange, onRemove, disableRemove }: Props) {
  const art = articles.find((a) => a.art_id === line.art_id);
  const unit = getUnitHT(art);
  const totalLine = unit * Number(line.quantite || 0);

  return (
    <div className="rounded-lg border p-3">
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-12 md:col-span-4">
          <select
            className="w-full border rounded-md px-3 h-10"
            value={line.art_id}
            onChange={(e) => onChange(idx, { art_id: Number(e.target.value) })}
          >
            <option value={0}>Sélectionner un article</option>
            {articles.map((a) => (
              <option key={a.art_id} value={a.art_id}>
                {a.art_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-6 md:col-span-2">
          <div className="border rounded-md px-3 h-10 text-sm bg-zinc-50 flex items-center justify-between">
            <span className="text-zinc-500">PU HT</span>
            <span className="font-semibold">{formatMoney(unit)} F</span>
          </div>
        </div>

        <div className="col-span-3 md:col-span-1">
          <input
            className="w-full border rounded-md px-3 h-10 text-center"
            type="number"
            min={1}
            value={line.quantite}
            onChange={(e) => onChange(idx, { quantite: Number(e.target.value) })}
          />
        </div>

        <div className="col-span-9 md:col-span-2">
          <input
            className="w-full border rounded-md px-3 h-10"
            placeholder="Référence"
            value={line.reference}
            onChange={(e) => onChange(idx, { reference: e.target.value })}
          />
        </div>

        <div className="col-span-10 md:col-span-2">
          <div className="border rounded-md px-3 h-10 text-sm bg-zinc-50 flex items-center gap-2 min-w-0">
            <span className="text-zinc-500 shrink-0">Remise</span>
            <span className="ml-auto font-semibold truncate text-right min-w-0">
              {getRemiseLabel(art)}
            </span>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 flex justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRemove(idx)}
            disabled={disableRemove}
            aria-label="Supprimer la ligne"
            className="h-10 w-10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-2 text-sm text-zinc-600 flex justify-end">
        Total ligne HT: <strong className="ml-2">{formatMoney(totalLine)} F</strong>
      </div>
    </div>
  );
}
