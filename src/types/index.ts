/** Supabase generated types map the canonical bigint IDs to JavaScript numbers. */
export type DomainId = number
export type UserId = string

export type Intensity = 'leve' | 'moderada' | 'alta'
export type TrainingExercise = {
  exercise: string
  sets?: number
  repetitions?: string
  load?: string
  rest?: string
  intensity?: Intensity
  duration?: string
  notes?: string
  order: number
}
