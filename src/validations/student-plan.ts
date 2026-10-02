import { z } from 'zod'
export const studentPlanSchema=z.object({student_id:z.coerce.number().int().positive(),unit_id:z.coerce.number().int().positive(),plan_id:z.coerce.number().int().positive(),start_date:z.iso.date(),end_date:z.iso.date().optional(),status:z.string().trim().min(1).optional(),observation:z.string().trim().min(1).optional()})
export type StudentPlanInput=z.infer<typeof studentPlanSchema>
