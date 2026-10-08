import { describe, expect, it } from 'vitest'
import { trainingExerciseSchema, trainingSchema, trainingStatusLabel, trainingStatusSchema, trainingUpdateSchema } from './training-plan'

describe('trainingSchema', () => {
  it('accepts canonical required fields', () => expect(trainingSchema.parse({ name: 'Força', student_modality_unit_id: 1 }).name).toBe('Força'))
  it('rejects missing name and invalid context', () => expect(() => trainingSchema.parse({ student_modality_unit_id: 0 })).toThrow())
  it('rejects invalid dates', () => expect(() => trainingSchema.parse({ name: 'A', student_modality_unit_id: 1, start_date: '10/10/2026' })).toThrow())
  it('rejects an end date before the start date', () => expect(() => trainingSchema.parse({ name: 'A', student_modality_unit_id: 1, start_date: '2026-10-11', end_date: '2026-10-10' })).toThrow('A data de término não pode ser anterior à data de início.'))
  it('restricts status to the canonical database values', () => {
    expect(trainingStatusSchema.parse('active')).toBe('active')
    expect(trainingStatusSchema.parse('inactive')).toBe('inactive')
    expect(() => trainingStatusSchema.parse('ativo')).toThrow()
    expect(() => trainingStatusSchema.parse('closed')).toThrow()
    expect(trainingStatusLabel('active')).toBe('Ativo')
    expect(trainingStatusLabel('inactive')).toBe('Inativo')
  })
  it('accepts partial updates while keeping the canonical status validation', () => {
    expect(trainingUpdateSchema.parse({ status: 'inactive' })).toEqual({ status: 'inactive' })
    expect(() => trainingUpdateSchema.parse({ status: 'arquivado' })).toThrow()
  })
})
describe('trainingExerciseSchema', () => {
  it('accepts canonical exercise fields', () => expect(trainingExerciseSchema.parse({ exercise_name: 'Agachamento', order: 0, intensity: 'moderada', sets: 3 }).sets).toBe(3))
  it('rejects invalid intensity and numeric values', () => { expect(() => trainingExerciseSchema.parse({ exercise_name: 'A', order: -1 })).toThrow(); expect(() => trainingExerciseSchema.parse({ exercise_name: 'A', order: 0, intensity: 'máxima' })).toThrow(); expect(() => trainingExerciseSchema.parse({ exercise_name: 'A', order: 0, load: -1 })).toThrow() })
})
