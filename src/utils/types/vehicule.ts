import { z } from "zod"
import { InvoiceSchema } from "./invoice" 

export const VehiculeSchema = z.object({
  id: z.string().optional(),

  licensePlate: z.string().min(1, "Immatriculation obligatoire"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z
    .number()
    .int("Année invalide")
    .min(1900, "Année invalide")
    .max(new Date().getFullYear() + 1, "Année invalide")
    .optional(),
  color: z.string().optional(),

  clientId: z.string().min(1, "Client obligatoire"),
  baseId: z.string().min(1, "Agence obligatoire"),
  entryDate: z.string().datetime().optional(),  

  // Relations
  client: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),

  base: z
    .object({
      id: z.string(),
      location: z.string(),
    })
    .optional(),

  invoices: z.array(InvoiceSchema).optional(),
  
})

export type Vehicule = z.infer<typeof VehiculeSchema>
