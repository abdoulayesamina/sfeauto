import { z } from "zod"

export const AgenceSchema = z.object({
  id: z.string(),

  location: z.string(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  clientId: z.string(),

  client: z.object({
    name: z.string(),
  }),

  _count: z.object({
    vehicles: z.number(),
  }),
})

export type Agence = z.infer<typeof AgenceSchema>
