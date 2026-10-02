import { describe, expect, it } from 'vitest'
import { passwordUpdateSchema } from './password'

describe('passwordUpdateSchema', () => {
  it('accepts a matching password with at least 8 characters', () => expect(passwordUpdateSchema.parse({ password: 'segura123', password_confirmation: 'segura123' }).password).toBe('segura123'))
  it('rejects a short password', () => expect(() => passwordUpdateSchema.parse({ password: '1234567', password_confirmation: '1234567' })).toThrow())
  it('rejects a mismatched confirmation', () => expect(() => passwordUpdateSchema.parse({ password: 'segura123', password_confirmation: 'diferente' })).toThrow())
})
