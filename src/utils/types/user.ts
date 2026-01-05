import { z } from "zod"

export const UserSchema = z.object({
  id: z.string(),

  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  role: z.string(),

  clientId: z.string().nullable(),
  baseId: z.string().nullable(),

  createdAt: z.string().datetime().optional,
  updatedAt: z.string().datetime().optional,

  client: z
    .object({
      name: z.string(),
    })
    .nullable(),

  base: z
    .object({
      location: z.string(),
    })
    .nullable(),
})

export type User = z.infer<typeof UserSchema>
