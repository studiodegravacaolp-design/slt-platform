import { z } from 'zod'

export const trainingStatuses = ['active', 'inactive'] as const
export const trainingStatusSchema = z.enum(trainingStatuses)

export const trainingStatusLabels: Record<(typeof trainingStatuses)[number], string> = {
  active: 'Ativo',
  inactive: 'Inativo',
}

export function trainingStatusLabel(status: string) {
  return status === 'active' || status === 'inactive' ? trainingStatusLabels[status] : status
}

const trainingFields = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  objective: z.string().trim().min(1).optional(),
  observations: z.string().trim().min(1).optional(),
  status: trainingStatusSchema.optional(),
  start_date: z.iso.date().optional(),
  end_date: z.iso.date().optional(),
  student_modality_unit_id: z.coerce.number().int().positive(),
})

export function assertTrainingDateRange(startDate?: string, endDate?: string) {
  if (startDate && endDate && endDate < startDate) {
    throw new Error('A data de término não pode ser anterior à data de início.')
  }
}

function dateRangeIssue(value: { start_date?: string; end_date?: string }, ctx: z.RefinementCtx) {
  if (value.start_date && value.end_date && value.end_date < value.start_date) {
    ctx.addIssue({ code: 'custom', path: ['end_date'], message: 'A data de término não pode ser anterior à data de início.' })
  }
}

export const trainingSchema = trainingFields.superRefine(dateRangeIssue)
export const trainingUpdateSchema = trainingFields.partial().superRefine(dateRangeIssue)

export const trainingExerciseSchema = z.object({
  exercise_name: z.string().trim().min(1),
  sets: z.coerce.number().int().positive().optional(),
  repetitions: z.coerce.number().int().positive().optional(),
  load: z.coerce.number().nonnegative().optional(),
  rest_time: z.coerce.number().int().nonnegative().optional(),
  duration: z.coerce.number().int().nonnegative().optional(),
  intensity: z.enum(['leve', 'moderada', 'alta']).optional(),
  observations: z.string().trim().min(1).optional(),
  order: z.coerce.number().int().nonnegative(),
})
