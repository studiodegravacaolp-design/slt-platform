import { describe, expect, it } from 'vitest'
import { buildAuthenticatedUserContext, resolveAuthenticatedAccessState } from './users'

const user = { id: 'user-1', organization_id: 10, name: 'Ana', email: 'ana@example.com', phone: null, avatar: null, status: 'active', last_access_at: null, created_at: '2026-01-01', updated_at: '2026-01-01' }

describe('buildAuthenticatedUserContext', () => {
  it('returns the safe context for a matching public user', () => expect(buildAuthenticatedUserContext(user, 'user-1', 10)).toMatchObject({ id: 'user-1', organization_id: 10, name: 'Ana' }))
  it('rejects a missing matching auth identity', () => expect(() => buildAuthenticatedUserContext(user, 'other-user', 10)).toThrow())
  it('rejects an invalid organization context', () => expect(() => buildAuthenticatedUserContext(user, 'user-1', 99)).toThrow())
  it('distinguishes unauthenticated, onboarding-required, and ready access states', () => {
    expect(resolveAuthenticatedAccessState({ authUserId: null, user: null })).toEqual({ kind: 'unauthenticated' })
    expect(resolveAuthenticatedAccessState({ authUserId: 'user-1', authEmail: 'ana@example.com', user: null })).toEqual({ kind: 'onboarding-required', userId: 'user-1', email: 'ana@example.com' })
    expect(resolveAuthenticatedAccessState({ authUserId: 'user-1', user, organizationId: 10 })).toMatchObject({ kind: 'ready', context: { id: 'user-1', organization_id: 10 } })
  })
})
