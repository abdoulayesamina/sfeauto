// export function formatLicensePlate(plate: string): string {
//   const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, "")

//   if (normalized.length === 7) {
//     return `${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5, 7)}`
//   }

//   return normalized
// }

export function formatLicensePlate(plate?: string): string {
  if (!plate) return ""

  const raw = plate.toUpperCase().replace(/[^A-Z0-9]/g, "")

  // AA123AA → AA-123-AA
  if (raw.length === 7 && /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(raw)) {
    return `${raw.slice(0, 2)}-${raw.slice(2, 5)}-${raw.slice(5)}`
  }

  // AA123A → AA 123 A
  if (raw.length === 6 && /^[A-Z]{2}\d{3}[A-Z]$/.test(raw)) {
    return `${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5)}`
  }

  // 1234AAA75 → 1234 AAA 75
  if (/^\d{1,4}[A-Z]{1,3}\d{2,3}$/.test(raw)) {
    const num = raw.match(/^\d+/)?.[0] || ""
    const letters = raw.slice(num.length).match(/^[A-Z]+/)?.[0] || ""
    const dept = raw.slice(num.length + letters.length)

    return `${num} ${letters} ${dept}`
  }

  // W123ABC → W-123-ABC
  if (/^W\d{3}[A-Z]{3}$/.test(raw)) {
    return `W-${raw.slice(1, 4)}-${raw.slice(4)}`
  }

  // fallback → on laisse l'utilisateur tranquille
  return plate.toUpperCase()
}


export const formatDateToISO = (date: string | Date) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};