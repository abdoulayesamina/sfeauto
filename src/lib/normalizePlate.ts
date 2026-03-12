

export function normalizePlate(plate: string) {
    return plate.replace(/[^A-Z0-9]/gi, "").toUpperCase()
}