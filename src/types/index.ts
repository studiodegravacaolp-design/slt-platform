/** bigint domain IDs cross the API boundary as strings to avoid precision loss. */
export type DomainId = string
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
