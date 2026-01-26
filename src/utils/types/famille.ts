import { z } from "zod";

export const FamilleSchema = z.object({
  fam_id: z.number().optional(),
  fam_name: z.string(),

  collections: z.array(
    z.object({
      col_id: z.number(),
      col_name: z.string(),
      col_familleId: z.number(),
    })
  ).optional(),

  _count: z.object({
    collections: z.number(),
  }).optional(),
});

export type Famille = z.infer<typeof FamilleSchema>;
