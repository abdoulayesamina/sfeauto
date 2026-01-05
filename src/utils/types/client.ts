import { z } from "zod"

export const ClientSchema = z.object({
  id: z.string(),

  name: z.string(),

  email: z.string().email().nullable(),
  phone: z.string().nullable(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  _count: z.object({
    bases: z.number(),
    vehicles: z.number(),
  }),
})

export type Client = z.infer<typeof ClientSchema>
