import { describe, expect, it } from 'vitest'
import { signupSchema } from './signup'

describe('signupSchema', () => {
  const valid = { name: ' Ana Silva ', email: 'ana@example.com', password: 'segura123', password_confirmation: 'segura123' }

  it('accepts the minimum public signup data and trims the profile name', () => {
    expect(signupSchema.parse(valid)).toMatchObject({ name: 'Ana Silva', email: 'ana@example.com' })
  })

  it('rejects blank names, invalid emails, short passwords and mismatched confirmation', () => {
    expect(() => signupSchema.parse({ ...valid, name: ' ' })).toThrow()
    expect(() => signupSchema.parse({ ...valid, email: 'invalido' })).toThrow()
    expect(() => signupSchema.parse({ ...valid, password: '1234567', password_confirmation: '1234567' })).toThrow()
    expect(() => signupSchema.parse({ ...valid, password_confirmation: 'diferente' })).toThrow()
  })
})
