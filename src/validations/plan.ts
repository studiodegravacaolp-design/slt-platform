import { z } from 'zod'
export const planSchema=z.object({name:z.string().trim().min(1),description:z.string().trim().min(1).optional(),periodicity:z.string().trim().min(1),value:z.coerce.number().positive(),status:z.string().trim().min(1).optional()})
export type PlanInput=z.infer<typeof planSchema>
