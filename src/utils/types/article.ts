import z from "zod";

export const ArticleSchema = z.object({
  art_id: z.number().optional(),
  art_name: z.string(),
  art_price: z.number(),
  art_collectionId: z.number(),

  collection: z.object({
    col_id: z.number(),
    col_name: z.string(),
    col_familleId: z.number(),
  }).optional(),
});

export type Article = z.infer<typeof ArticleSchema>;
