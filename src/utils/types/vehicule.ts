import { z } from "zod";
import { InterventionSchema } from "./intervention";

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
  veh_id: z.string().optional(),

  veh_licensePlate: z.string().min(1, "Immatriculation obligatoire"),
  veh_brandId: z.string().nullable().optional(),
  veh_modelId: z.string().nullable().optional(),

  veh_brand: z.object({
    bra_id: z.string(),
    bra_name: z.string()
  }).optional(),

  veh_model:z.object({
    mod_id: z.string(),
    mod_name: z.string()
  }).optional(),

  veh_year: z
    .coerce
    .number()
    .int("Année invalide")
    .min(1900, "Année invalide")
    .max(new Date().getFullYear() + 1, "Année invalide")
    .optional(),

  veh_color: z.string().optional(),

  veh_firstRegistrationDate: z.string().datetime().optional(),
  veh_energy: VehicleEnergySchema.optional(),
  veh_doorsCount: z.coerce.number().int("Nombre de portes invalide").min(1).max(9).optional(),
  veh_bodyType: BodyTypeSchema.optional(),
  veh_realPowerHp: z.coerce.number().int("Puissance réelle invalide").min(0).max(2000).optional(),
  veh_fiscalPowerCv: z.coerce.number().int("Puissance fiscale invalide").min(0).max(200).optional(),
  veh_gearboxType: GearboxTypeSchema.optional(),
  veh_version: z.string().optional(),
  veh_registrationCardDate: z.string().datetime().optional(),

  veh_clientId: z.string().min(1, "Client obligatoire"),
  veh_baseId: z.string().min(1, "Agence obligatoire"),

  veh_entryDate: z.string().datetime().optional(),
  veh_exitDate: z.string().datetime().optional(),

  veh_client: z
    .object({
      cli_id: z.string(),
      cli_name: z.string(),
    })
    .optional(),

  veh_base: z
    .object({
      bas_id: z.string(),
      bas_location: z.string(),
    })
    .optional(),

    

  interventions: z.array(InterventionSchema).optional(),
});

export type Vehicule = z.infer<typeof VehiculeSchema>;
