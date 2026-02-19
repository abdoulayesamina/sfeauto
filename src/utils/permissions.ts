
export function canCreateDevis(role?: string | null) {
  if (!role) return false;

  if (role === "MECHANIC") return false;

  return ["ADMIN", "MANAGER"].includes(role);
}
