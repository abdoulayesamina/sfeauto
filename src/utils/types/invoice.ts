import { z } from "zod"

export const InvoiceSchema = z.object({
  id: z.string().optional(),
  accordNumber: z.string(),
  dateOfConfirmation: z.string().datetime().optional(),
  invoiceConfirmed: z.boolean(),
  status: z.enum(['CONFIRMED_IN_PLANNING', 'WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED']),
  statusUpdatedAt: z.string().datetime().optional(),
  workDescription: z.string(),
  didOrderParts: z.boolean(),
  ordersDetails: z.string(),
  comments: z.string(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  vehicleId: z.string(),
  handledById: z.string()
})

export type Invoice = z.infer<typeof InvoiceSchema>
