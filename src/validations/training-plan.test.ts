import { describe, expect, it } from 'vitest'
import { trainingExerciseSchema, trainingSchema } from './training-plan'

describe('trainingSchema', () => {
  it('accepts canonical required fields', () => expect(trainingSchema.parse({ name: 'Força', student_modality_unit_id: 1 }).name).toBe('Força'))
  it('rejects missing name and invalid context', () => expect(() => trainingSchema.parse({ student_modality_unit_id: 0 })).toThrow())
  it('rejects invalid dates', () => expect(() => trainingSchema.parse({ name: 'A', student_modality_unit_id: 1, start_date: '10/10/2026' })).toThrow())
})
describe('trainingExerciseSchema', () => {
  it('accepts canonical exercise fields', () => expect(trainingExerciseSchema.parse({ exercise_name: 'Agachamento', order: 0, intensity: 'moderada', sets: 3 }).sets).toBe(3))
  it('rejects invalid intensity and numeric values', () => { expect(() => trainingExerciseSchema.parse({ exercise_name: 'A', order: -1 })).toThrow(); expect(() => trainingExerciseSchema.parse({ exercise_name: 'A', order: 0, intensity: 'máxima' })).toThrow(); expect(() => trainingExerciseSchema.parse({ exercise_name: 'A', order: 0, load: -1 })).toThrow() })
})
