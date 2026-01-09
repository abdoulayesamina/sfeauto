import { z } from "zod"

export const VehiculeSchema = z.object({

  baseId: z
    .string()
    .min(1, "Agence obligatoire"),

  id: z
    .string()
    .optional(),

  clientId: z
    .string()
    .min(1, "Client obligatoire"),

  licensePlate: z
    .string()
    .min(1, "Immatriculation obligatoire"),

  brand: z
    .string()
    .optional(),

  model: z
    .string()
    .optional(),

  year: z
    .number()
    .int("Année invalide")
    .min(1900, "Année invalide")
    .max(new Date().getFullYear() + 1, "Année invalide")
    .optional(),

  color: z
    .string()
    .optional(),
})


export type Vehicule = z.infer<typeof VehiculeSchema>
