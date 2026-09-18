import { describe, expect, it } from 'vitest'
import { evaluationCreateSchema, evaluationResultCreateSchema } from './evaluation'

describe('evaluation schemas', () => {
  it('accepts canonical evaluation fields', () => expect(evaluationCreateSchema.parse({ student_id: 1, unit_id: 2, modality_id: 3, date: '2026-09-18', type: 'Física' })).toMatchObject({ type: 'Física' }))
  it('rejects invalid required evaluation fields', () => {
    expect(() => evaluationCreateSchema.parse({ student_id: 0, unit_id: 2, modality_id: 3, date: '2026-09-18', type: 'Física' })).toThrow()
    expect(() => evaluationCreateSchema.parse({ student_id: 1, unit_id: 2, modality_id: 3, date: '18/09/2026', type: 'Física' })).toThrow()
    expect(() => evaluationCreateSchema.parse({ student_id: 1, unit_id: 2, modality_id: 3, date: '2026-09-18', type: ' ' })).toThrow()
  })
  it('accepts result metric, value, unit, and observation', () => expect(evaluationResultCreateSchema.parse({ metric: 'Peso', value: '72,5', unit_of_measure: 'kg', observation: 'Em jejum' }).metric).toBe('Peso'))
  it('rejects empty metric or value', () => {
    expect(() => evaluationResultCreateSchema.parse({ metric: ' ', value: '72' })).toThrow()
    expect(() => evaluationResultCreateSchema.parse({ metric: 'Peso', value: ' ' })).toThrow()
  })
})
