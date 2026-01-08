import z from "zod";
import { UserSchema } from "./user";
import { VehiculeSchema } from "./vehicule";
import { AgenceSchema } from "./agence";

export const StatusHistoryItemSchema = z.object({
  id: z.string(),
  previousStatus: z.string(),
  newStatus: z.string(),
  changedAt: z.string(),
  changedBy: UserSchema.pick({ name: true }), 
})


export const InterventionSchema = z.object({
  id: z.string(),
  accordNumber: z.string(),
  dateOfConfirmation: z.string(),
  status: z.string(),
  statusUpdatedAt: z.string(),
  workDescription: z.string(),
  didOrderParts: z.boolean(),
  ordersDetails: z.nullable(z.any()),
  comments: z.nullable(z.any()),
  createdAt: z.string(),
  vehicle: VehiculeSchema,
  handledBy: AgenceSchema.pick({location : true}), 
  statusHistory: z.array(StatusHistoryItemSchema),
})

export type Intervention = z.infer<typeof InterventionSchema>
