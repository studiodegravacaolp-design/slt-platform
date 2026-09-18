import { z } from 'zod'

export const trainingExerciseSchema = z.object({
  exercise: z.string().trim().min(1),
  sets: z.coerce.number().int().positive().optional(),
  repetitions: z.string().trim().optional(),
  load: z.string().trim().optional(),
  rest: z.string().trim().optional(),
  intensity: z.enum(['leve', 'moderada', 'alta']).optional(),
  duration: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  order: z.coerce.number().int().nonnegative(),
})
