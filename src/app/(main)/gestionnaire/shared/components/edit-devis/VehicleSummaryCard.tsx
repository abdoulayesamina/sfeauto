"use client";

type Props = { devis: any };

export function VehicleSummaryCard({ devis }: Props) {
  if (!devis?.vehicle) return null;

  const brand = devis.vehicle?.brand?.name || "—";
  const model = devis.vehicle?.model?.name || "";
  const plate = devis.vehicle?.licensePlate || "—";
  const client = devis?.client?.name || "—";
  const num = devis?.dev_numdevis;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-xs text-zinc-500">Véhicule</div>
          <div className="text-lg font-semibold text-zinc-900 truncate">
            {brand} {model}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-800">
              {plate}
            </span>
            {num && (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-700">
                {num}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
          <div className="rounded-lg border bg-zinc-50 px-3 py-2">
            <div className="text-xs text-zinc-500">Client</div>
            <div className="text-sm font-semibold text-zinc-900 truncate">{client}</div>
          </div>
          <div className="rounded-lg border bg-zinc-50 px-3 py-2">
            <div className="text-xs text-zinc-500">Marque</div>
            <div className="text-sm font-semibold text-zinc-900 truncate">{brand}</div>
          </div>
          <div className="rounded-lg border bg-zinc-50 px-3 py-2">
            <div className="text-xs text-zinc-500">Modèle</div>
            <div className="text-sm font-semibold text-zinc-900 truncate">{model || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
