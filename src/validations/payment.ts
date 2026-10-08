import { z } from 'zod'
export const paymentSchema=z.object({charge_id:z.coerce.number().int().positive(),amount_paid:z.coerce.number().positive(),payment_date:z.iso.date(),payment_method:z.enum(['cash','pix','card','transfer']),observation:z.string().trim().min(1).optional(),idempotency_key:z.uuid()})
export type PaymentInput=z.infer<typeof paymentSchema>
