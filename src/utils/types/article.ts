import z from "zod";

export const ArticleSchema = z.object({
  art_id: z.number().optional(),
  art_reference: z.string(),
  art_name: z.string(),
  art_price: z.number(),
  art_collectionId: z.number(),
  art_codeArticle: z.string().optional(),
  remise: z.object({
    rem_id: z.number().optional(),
    rem_prixremise: z.number().nullable(),
    rem_pourcentage: z.number().nullable(),
    rem_articleId: z.number(),
  }).optional(),
  collection: z.object({
    col_id: z.number(),
    col_name: z.string(),
    col_familleId: z.number(),
  }).optional(),
});

export type Article = z.infer<typeof ArticleSchema>;
