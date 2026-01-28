import { z } from "zod"

export const ClientSchema = z.object({
  id: z.string(),

  name: z.string(),

  email: z.string().email().nullable(),
  phone: z.string().nullable(),

  cli_adresseFacturation: z.string().nullable(),
  cli_numClient: z.string().nullable(),
  cli_tvaIntraCommunautaire: z.string().nullable(),

  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  _count: z.object({
    bases: z.number(),
    vehicles: z.number(),
  }),
  
})

export type Client = z.infer<typeof ClientSchema>


