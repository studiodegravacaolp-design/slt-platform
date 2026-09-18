import { z } from 'zod'
export const studentModalityUnitSchema = z.object({ unit_id: z.coerce.number().int().positive(), modality_id: z.coerce.number().int().positive(), start_date: z.iso.date(), status: z.string().trim().min(1).optional(), end_date: z.iso.date().optional(), observation: z.string().trim().min(1).optional() })
export type StudentModalityUnitInput = z.infer<typeof studentModalityUnitSchema>
