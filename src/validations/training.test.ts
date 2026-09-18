import { describe, expect, it } from 'vitest'
import { trainingExerciseSchema } from './training'

describe('trainingExerciseSchema', () => {
  it('accepts the canonical intensity values', () => {
    expect(trainingExerciseSchema.parse({ exercise: 'Agachamento', intensity: 'moderada', order: 0 }).intensity).toBe('moderada')
  })
  it('rejects unsupported intensities', () => {
    expect(() => trainingExerciseSchema.parse({ exercise: 'Agachamento', intensity: 'máxima', order: 0 })).toThrow()
  })
})
