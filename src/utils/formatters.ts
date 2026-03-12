export function formatLicensePlate(plate: string): string {
  const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, "")

  if (normalized.length === 7) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5, 7)}`
  }

  return normalized
}