import z from "zod";

export const CollectionSchema = z.object({
  col_id: z.number().optional(),
  col_name: z.string(),
  col_familleId: z.number(),

  col_famille: z.object({
    fam_id: z.number(),
    fam_name: z.string(),
  }).optional(),

  articles: z.array(
    z.object({
      art_id: z.number(),
      art_name: z.string(),
      art_price: z.number(),
      art_collectionId: z.number(),
    })
  ).optional(),

  _count: z.object({
    articles: z.number(),
  }).optional(),
});

export type Collection = z.infer<typeof CollectionSchema>;
