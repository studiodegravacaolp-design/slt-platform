import { describe, expect, it } from 'vitest'
import { studentCreateSchema } from './student'

describe('studentCreateSchema', () => {
  it('accepts the confirmed required student fields', () => {
    expect(studentCreateSchema.parse({ full_name: 'Ana Silva', birth_date: '2011-03-18' })).toMatchObject({ full_name: 'Ana Silva' })
  })
  it('rejects an invalid birth date', () => {
    expect(() => studentCreateSchema.parse({ full_name: 'Ana Silva', birth_date: '18/03/2011' })).toThrow()
  })
})
