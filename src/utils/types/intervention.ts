import { z } from "zod"

export const InterventionSchema = z.object({
  int_id: z.string().optional(),
  int_accordNumber: z.string(),
  int_dateOfConfirmation: z.string().datetime().optional(),
  int_interventionConfirmed: z.boolean(),
  int_status: z.enum(['WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED']),
  int_statusUpdatedAt: z.string().datetime().optional(),
  int_workDescription: z.string(),
  int_didOrderParts: z.boolean(),
  int_ordersDetails: z.string(),
  int_comments: z.string(),
  int_createdAt: z.string().datetime().optional(),
  int_updatedAt: z.string().datetime().optional(),
  int_vehicleId: z.string(),
  int_handledById: z.string(),
  int_kilometrage: z.string().optional(),
})

export type Intervention = z.infer<typeof InterventionSchema>
