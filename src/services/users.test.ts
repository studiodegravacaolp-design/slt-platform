import { describe, expect, it } from 'vitest'
import { buildAuthenticatedUserContext } from './users'

const user = { id: 'user-1', organization_id: 10, name: 'Ana', email: 'ana@example.com', phone: null, avatar: null, status: 'active', last_access_at: null, created_at: '2026-01-01', updated_at: '2026-01-01' }

describe('buildAuthenticatedUserContext', () => {
  it('returns the safe context for a matching public user', () => expect(buildAuthenticatedUserContext(user, 'user-1', 10)).toMatchObject({ id: 'user-1', organization_id: 10, name: 'Ana' }))
  it('rejects a missing matching auth identity', () => expect(() => buildAuthenticatedUserContext(user, 'other-user', 10)).toThrow())
  it('rejects an invalid organization context', () => expect(() => buildAuthenticatedUserContext(user, 'user-1', 99)).toThrow())
})
