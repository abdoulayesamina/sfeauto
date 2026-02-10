import { z } from "zod";
import { InvoiceSchema } from "./invoice";

export const VehicleEnergySchema = z.enum([
  "GAZOLE",
  "ESSENCE",
  "HYBRIDE",
  "ELECTRIQUE",
  "GPL",
]);

export const GearboxTypeSchema = z.enum(["BVM", "BVA"]);

export const BodyTypeSchema = z.enum([
  "BERLINE",
  "SUV",
  "BREAK",
  "COUPE",
  "CABRIOLET",
  "MONOSPACE",
  "PICKUP",
  "UTILITAIRE",
  "AUTRE",
]);

export const VehiculeSchema = z.object({
  id: z.string().optional(),

  licensePlate: z.string().min(1, "Immatriculation obligatoire"),
  brandId: z.string().nullable().optional(),
  modelId: z.string().nullable().optional(),


  year: z
    .coerce
    .number()
    .int("Année invalide")
    .min(1900, "Année invalide")
    .max(new Date().getFullYear() + 1, "Année invalide")
    .optional(),

  color: z.string().optional(),

  firstRegistrationDate: z.string().datetime().optional(),
  energy: VehicleEnergySchema.optional(),
  doorsCount: z.coerce.number().int("Nombre de portes invalide").min(1).max(9).optional(),
  bodyType: BodyTypeSchema.optional(),
  realPowerHp: z.coerce.number().int("Puissance réelle invalide").min(0).max(2000).optional(),
  fiscalPowerCv: z.coerce.number().int("Puissance fiscale invalide").min(0).max(200).optional(),
  gearboxType: GearboxTypeSchema.optional(),
  version: z.string().optional(),
  registrationCardDate: z.string().datetime().optional(),

  clientId: z.string().min(1, "Client obligatoire"),
  baseId: z.string().min(1, "Agence obligatoire"),

  entryDate: z.string().datetime().optional(),
  exitDate: z.string().datetime().optional(),

  client: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),

  base: z
    .object({
      id: z.string(),
      location: z.string(),
    })
    .optional(),

  invoices: z.array(InvoiceSchema).optional(),
});

export type Vehicule = z.infer<typeof VehiculeSchema>;
