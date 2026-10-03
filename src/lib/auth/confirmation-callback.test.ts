import { describe, expect, it } from 'vitest'
import { getConfirmationDestination, getConfirmationPayload, getConfirmationRedirectUrl } from './confirmation-callback'

describe('confirmation callback', () => {
  it('sends signup confirmations to onboarding', () => {
    expect(getConfirmationPayload(new URLSearchParams({ code: 'signup-code', flow: 'signup' }))).toEqual({ kind: 'code', flow: 'signup', value: 'signup-code' })
    expect(getConfirmationDestination('signup')).toBe('/onboarding')
  })

  it('preserves recovery confirmations and does not accept an arbitrary destination', () => {
    expect(getConfirmationPayload(new URLSearchParams({ token_hash: 'recovery-token', type: 'recovery', next: 'https://untrusted.example' }))).toEqual({ kind: 'token_hash', flow: 'recovery', value: 'recovery-token' })
    expect(getConfirmationDestination('recovery')).toBe('/reset-password')
    expect(getConfirmationRedirectUrl('http://localhost:3000', 'signup')).toBe('http://localhost:3000/auth/confirm?flow=signup')
  })
})
