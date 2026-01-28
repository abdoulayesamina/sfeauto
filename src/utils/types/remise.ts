import { z } from "zod";

export const RemiseSchema = z.object({
  rem_id: z.number().optional(),

  rem_prixremise: z.number().nullable(),
  rem_pourcentage: z.number().nullable(),

  rem_articleId: z.number(),

  article: z
    .object({
      art_id: z.number(),
      art_name: z.string(),
      art_price: z.number(),
      art_collectionId: z.number(),
    })
    .optional(),
});

export type Remise = z.infer<typeof RemiseSchema>;
