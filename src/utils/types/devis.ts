import z from "zod";
import { ArticleSchema } from "./article";
import { ClientSchema } from "./client";
import { VehiculeSchema } from "./vehicule";
import { InvoiceSchema } from "./invoice";
import { UserSchema } from "./user";

export const DevisSchema = z.object({
    dev_id: z.number().optional(),

    // --- Liens métier ---
    dev_cli_id: z.string(),
    dev_veh_id: z.string(),
    dev_invoice_id: z.string().nullable().optional(),
    dev_user: z.string().nullable().optional(),

    // --- Données devis ---
    dev_adressefacturation: z.string().nullable().optional(),
    dev_numdevis: z.string(),

    dev_datecreation: z.date().optional(),

    dev_totalht: z.number(),
    dev_totaltva: z.number(),
    dev_totalttc: z.number(),

    dev_tva: z.number().nullable().optional(),
    dev_supprimee: z.boolean().optional(),

    // --- Validation ---
    dev_accordNumber: z.string().nullable().optional(),
    dev_dateAccord: z.date().nullable().optional(),

    // --- Articles ---
    articles: z.array(z.unknown()).optional(),

    // --- Relations (si exposées) ---
    client: ClientSchema.optional(),
    vehicle: VehiculeSchema.optional(),
    invoice: InvoiceSchema.nullable().optional(),
    user: UserSchema.nullable().optional(),
});


export type Devis = z.infer<typeof DevisSchema>;
