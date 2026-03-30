import { z } from "zod"

export const ClientSchema = z.object({
  cli_id: z.string(),

  cli_name: z.string(),

  cli_email: z.string().email().nullable(),
  cli_phone: z.string().nullable(),

  cli_adresseFacturation: z.string().nullable(),
  cli_numClient: z.string().nullable(),
  cli_tvaIntraCommunautaire: z.string().nullable(),

  cli_createdAt: z.string().datetime().optional(),
  cli_updatedAt: z.string().datetime().optional(),

  _count: z.object({
    bases: z.number(),
    vehicles: z.number(),
  }),
})

export type Client = z.infer<typeof ClientSchema>