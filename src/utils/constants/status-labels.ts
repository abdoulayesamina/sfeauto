// Libellés lisibles des statuts d'intervention (identiques à ceux affichés dans l'UI).
// Version "pure" (sans icônes) utilisable aussi bien côté serveur que côté client.

export const WORK_STATUS_LABELS: Record<string, string> = {
  FIXING_STARTED: "En cours",
  WAITING_FOR_PARTS: "En attente de pièces",
  FIXING_FINISHED: "Terminée",
};

export const getStatusLabel = (status?: string | null): string => {
  if (!status) return "—";
  return WORK_STATUS_LABELS[status] ?? status;
};
