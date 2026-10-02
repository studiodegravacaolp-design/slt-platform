import { describe, expect, it } from 'vitest'
import { organizationOnboardingSchema } from './onboarding'

describe('organizationOnboardingSchema', () => {
  it('accepts a required name and normalizes optional fields', () => {
    expect(organizationOnboardingSchema.parse({ name: '  Academia SLT  ', trade_name: ' ', email: '', phone: ' 11999999999 ' })).toEqual({ name: 'Academia SLT', trade_name: undefined, email: undefined, phone: '11999999999' })
  })

  it('rejects blank organization names and invalid optional emails', () => {
    expect(() => organizationOnboardingSchema.parse({ name: ' ' })).toThrow()
    expect(() => organizationOnboardingSchema.parse({ name: 'SLT', email: 'invalido' })).toThrow()
  })
})
