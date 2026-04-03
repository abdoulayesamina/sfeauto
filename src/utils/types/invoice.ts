import { z } from "zod"

export const InvoiceSchema = z.object({
  int_id: z.string().optional(),
  int_accordNumber: z.string(),
  int_dateOfConfirmation: z.string().datetime().optional(),
  int_invoiceConfirmed: z.boolean(),
  int_status: z.enum(['CONFIRMED_IN_PLANNING', 'WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED']),
  int_statusUpdatedAt: z.string().datetime().optional(),
  int_workDescription: z.string(),
  int_didOrderParts: z.boolean(),
  int_ordersDetails: z.string(),
  int_comments: z.string(),
  int_createdAt: z.string().datetime().optional(),
  int_updatedAt: z.string().datetime().optional(),
  int_vehicleId: z.string(),
  int_handledById: z.string()
})

export type Invoice = z.infer<typeof InvoiceSchema>
