import { z } from "zod"

export const AgenceSchema = z.object({
  bas_id: z.string(),

  bas_location: z.string(),

  bas_createdAt: z.string().datetime().optional(),
  bas_updatedAt: z.string().datetime().optional(),

  bas_clientId: z.string(),

  bas_client: z.object({
    cli_name: z.string(),
  }),

  _count: z.object({
    vehicles: z.number(),
  }),
})

export type Agence = z.infer<typeof AgenceSchema>