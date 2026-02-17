"use client";

import { formatMoney } from "@/src/utils/devisPricing";


type Props = { totalHT: number; totalTTC: number; devTva: number };

export function TotalsCard({ totalHT, totalTTC, devTva }: Props) {
  return (
    <div className="rounded-lg border p-4 bg-zinc-50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-600">Total HT</div>
        <div className="text-lg font-semibold">{formatMoney(totalHT)} F</div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-sm text-zinc-600">Total TTC (TVA {devTva}%)</div>
        <div className="text-base font-semibold">{formatMoney(totalTTC)} F</div>
      </div>
    </div>
  );
}
