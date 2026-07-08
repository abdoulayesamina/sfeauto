// Catégorisation visuelle des interventions non terminées selon leur ancienneté.
// 3 à 4 jours depuis la création -> orange, 5 jours ou plus -> rouge.

export type InterventionAgeLevel = "warning" | "danger";

const FINISHED_STATUSES = new Set(["FIXING_FINISHED", "TERMINEE"]);

export type InterventionAgeMeta = {
  level: InterventionAgeLevel;
  days: number;
  className: string;
  title: string;
};

export function getInterventionAgeMeta(
  status: string | null | undefined,
  createdAt: string | null | undefined,
): InterventionAgeMeta | null {
  if (!status || !createdAt || FINISHED_STATUSES.has(status)) return null;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;

  const days = Math.floor(
    (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days >= 5) {
    return {
      level: "danger",
      days,
      className: "border-l-4 border-l-red-500",
      title: `Intervention non terminée depuis ${days} jours — nécessite une attention urgente`,
    };
  }

  if (days >= 3) {
    return {
      level: "warning",
      days,
      className: "border-l-4 border-l-orange-400",
      title: `Intervention non terminée depuis ${days} jours`,
    };
  }

  return null;
}
