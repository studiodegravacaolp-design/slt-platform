import { describe, expect, it } from 'vitest'
import { passwordRecoveryRequestSchema } from './password-recovery'

describe('passwordRecoveryRequestSchema', () => {
  it('accepts a valid email address', () => {
    expect(passwordRecoveryRequestSchema.parse({ email: 'profissional@slt.com' }).email).toBe('profissional@slt.com')
  })

  it('rejects an invalid email address', () => {
    expect(passwordRecoveryRequestSchema.safeParse({ email: 'invalido' }).success).toBe(false)
  })

  it('rejects a missing email address', () => {
    expect(passwordRecoveryRequestSchema.safeParse({}).success).toBe(false)
  })
})
