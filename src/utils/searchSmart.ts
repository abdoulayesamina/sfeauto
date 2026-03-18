export function normalizePlate(plate: string) {
  return plate.replace(/[^A-Z0-9]/gi, "").toUpperCase()
}

export function searchSmart(input: string) {
  const trimmed = input.trim()

  return {
    raw: trimmed,
    normalized: normalizePlate(trimmed),
    lower: trimmed.toLowerCase(),
  }
}