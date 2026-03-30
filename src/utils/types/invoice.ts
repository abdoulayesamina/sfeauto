import { z } from "zod"

export const InvoiceSchema = z.object({
  inv_id: z.string().optional(),
  inv_accordNumber: z.string(),
  inv_dateOfConfirmation: z.string().datetime().optional(),
  inv_invoiceConfirmed: z.boolean(),
  inv_status: z.enum(['CONFIRMED_IN_PLANNING', 'WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED']),
  inv_statusUpdatedAt: z.string().datetime().optional(),
  inv_workDescription: z.string(),
  inv_didOrderParts: z.boolean(),
  inv_ordersDetails: z.string(),
  inv_comments: z.string(),
  inv_createdAt: z.string().datetime().optional(),
  inv_updatedAt: z.string().datetime().optional(),
  inv_vehicleId: z.string(),
  inv_handledById: z.string()
})

export type Invoice = z.infer<typeof InvoiceSchema>
