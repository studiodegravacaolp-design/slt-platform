import { z } from 'zod'
export const chargeSchema=z.object({student_id:z.coerce.number().int().positive(),unit_id:z.coerce.number().int().positive(),student_plan_id:z.coerce.number().int().positive(),description:z.string().trim().min(1).optional(),issue_date:z.iso.date(),due_date:z.iso.date(),value:z.coerce.number().positive(),status:z.string().trim().min(1),observation:z.string().trim().min(1).optional()})
export type ChargeInput=z.infer<typeof chargeSchema>
