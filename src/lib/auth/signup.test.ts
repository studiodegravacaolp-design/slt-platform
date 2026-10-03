import { describe, expect, it } from 'vitest'
import { buildSignupRequest, getSignupDestination } from './signup'

describe('signup request', () => {
  it('sends only the profile name as signup metadata', () => {
    const request = buildSignupRequest({ name: 'Ana Silva', email: 'ana@example.com', password: 'segura123', password_confirmation: 'segura123' }, 'http://localhost:3000/auth/confirm?flow=signup')
    expect(request).toEqual({ email: 'ana@example.com', password: 'segura123', options: { data: { name: 'Ana Silva' }, emailRedirectTo: 'http://localhost:3000/auth/confirm?flow=signup' } })
    expect(request.options.data).not.toHaveProperty('organization_id')
    expect(request.options.data).not.toHaveProperty('role')
  })

  it('does not leave authenticated users on the signup page', () => {
    expect(getSignupDestination({ kind: 'unauthenticated' })).toBeNull()
    expect(getSignupDestination({ kind: 'onboarding-required', userId: 'user-1', email: 'ana@example.com' })).toBe('/onboarding')
    expect(getSignupDestination({ kind: 'ready', context: { id: 'user-1', organization_id: 1, name: 'Ana', email: 'ana@example.com', phone: null, avatar: null, status: 'active', last_access_at: null } })).toBe('/home')
  })
})
