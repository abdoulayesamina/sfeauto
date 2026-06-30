// Formatage du message enrichi affiché quand un numéro d'accord est déjà utilisé.
// Utilisé côté frontend (SweetAlert html) pour les conflits d'intervention et de devis.

import { HISTORY_LABELS } from "@/src/utils/constants/intervention-status";

export type AccordConflictVehicle = {
  licensePlate?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  client?: string | null;
  base?: string | null;
};

export type AccordConflictDetails = {
  accordNumber?: string | null;
  conflictType?: "intervention" | "devis";
  interventionId?: string | null;
  devisNumber?: string | null;
  createdAt?: string | null;
  status?: string | null;
  workDescription?: string | null;
  vehicle?: AccordConflictVehicle | null;
};

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function row(label: string, value?: string | null): string {
  if (!value) return "";
  return `
    <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;">
      <span style="color:#6b7280;">${escapeHtml(label)}</span>
      <span style="font-weight:600;color:#111827;text-align:right;">${escapeHtml(value)}</span>
    </div>`;
}

/**
 * Construit le HTML détaillé d'un conflit de numéro d'accord.
 * Affiche le véhicule, le client/agence et l'intervention (ou le devis) qui utilise déjà ce numéro.
 */
export function formatAccordConflictHtml(details?: AccordConflictDetails | null): string {
  if (!details) return "";

  const v = details.vehicle ?? {};

  const vehicleLabel = [v.brand, v.model].filter(Boolean).join(" ") || null;
  const statusLabel = details.status
    ? HISTORY_LABELS[details.status] ?? details.status
    : null;

  const createdLabel = details.createdAt
    ? new Date(details.createdAt).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const conflictTitle =
    details.conflictType === "devis"
      ? "Devis utilisant déjà ce numéro"
      : "Intervention utilisant déjà ce numéro";

  return `
    <div style="text-align:left;font-size:14px;">
      <p style="margin:0 0 12px;color:#374151;">
        Le numéro d'accord
        <span style="font-weight:700;color:#b91c1c;">${escapeHtml(details.accordNumber)}</span>
        est déjà rattaché à l'élément suivant :
      </p>

      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;background:#f9fafb;">
        <div style="font-weight:700;color:#111827;margin-bottom:6px;">Véhicule</div>
        ${row("Marque / Modèle", vehicleLabel)}
        ${row("Plaque", v.licensePlate ?? null)}
        ${row("Année", v.year != null ? String(v.year) : null)}
        ${row("Client", v.client ?? null)}
        ${row("Agence", v.base ?? null)}
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;background:#f9fafb;margin-top:10px;">
        <div style="font-weight:700;color:#111827;margin-bottom:6px;">${escapeHtml(conflictTitle)}</div>
        ${row("N° devis", details.devisNumber ?? null)}
        ${row("Statut", statusLabel)}
        ${row("Travaux", details.workDescription ?? null)}
        ${row("Créée le", createdLabel)}
      </div>
    </div>`;
}
