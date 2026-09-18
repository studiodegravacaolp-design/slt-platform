import { z } from 'zod'

const optionalText = z.string().trim().min(1).optional()

export const evaluationCreateSchema = z.object({
  student_id: z.coerce.number().int().positive(),
  unit_id: z.coerce.number().int().positive(),
  modality_id: z.coerce.number().int().positive(),
  date: z.iso.date(),
  type: z.string().trim().min(1),
})

export const evaluationUpdateSchema = z.object({ date: z.iso.date().optional(), type: z.string().trim().min(1).optional() })

export const evaluationResultCreateSchema = z.object({
  metric: z.string().trim().min(1),
  value: z.string().trim().min(1),
  unit_of_measure: optionalText,
  observation: optionalText,
})

export const evaluationResultUpdateSchema = evaluationResultCreateSchema.partial()

export type EvaluationCreateInput = z.infer<typeof evaluationCreateSchema>
export type EvaluationUpdateInput = z.infer<typeof evaluationUpdateSchema>
export type EvaluationResultCreateInput = z.infer<typeof evaluationResultCreateSchema>
export type EvaluationResultUpdateInput = z.infer<typeof evaluationResultUpdateSchema>
