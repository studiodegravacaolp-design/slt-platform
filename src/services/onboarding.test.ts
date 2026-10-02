import { describe, expect, it, vi } from 'vitest'

const { createClientMock, getAuthenticatedAccessStateMock, rpcMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getAuthenticatedAccessStateMock: vi.fn(),
  rpcMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: createClientMock }))
vi.mock('@/services/users', () => ({ getAuthenticatedAccessState: getAuthenticatedAccessStateMock }))

import { buildBootstrapOrganizationPayload } from './onboarding'
import { bootstrapCurrentUserOrganization } from './onboarding'

describe('buildBootstrapOrganizationPayload', () => {
  it('maps only canonical RPC parameters and excludes privileged client ids', () => {
    const payload = buildBootstrapOrganizationPayload({
      name: 'SLT',
      trade_name: 'SLT Centro',
      email: 'contato@slt.test',
      phone: '11999999999',
      ...({ user_id: 'forged', organization_id: 999, owner_id: 'forged', role: 'admin' } as object),
    })
    expect(payload).toEqual({ p_name: 'SLT', p_trade_name: 'SLT Centro', p_email: 'contato@slt.test', p_phone: '11999999999' })
    expect(payload).not.toHaveProperty('user_id')
    expect(payload).not.toHaveProperty('organization_id')
  })

  it('does not invoke the RPC when the user already has an organization context', async () => {
    getAuthenticatedAccessStateMock.mockReset()
    createClientMock.mockReset()
    getAuthenticatedAccessStateMock.mockResolvedValue({ kind: 'ready', context: { id: 'user-1', organization_id: 10 } })

    await expect(bootstrapCurrentUserOrganization({ name: 'SLT' })).resolves.toMatchObject({ kind: 'ready', context: { organization_id: 10 } })
    expect(createClientMock).not.toHaveBeenCalled()
  })

  it('returns a controlled error when the RPC fails without creating a context', async () => {
    getAuthenticatedAccessStateMock.mockReset()
    rpcMock.mockReset()
    getAuthenticatedAccessStateMock.mockResolvedValue({ kind: 'onboarding-required', userId: 'user-1', email: 'ana@example.com' })
    createClientMock.mockResolvedValue({ rpc: rpcMock })
    rpcMock.mockResolvedValue({ data: null, error: { message: 'internal database error' } })

    await expect(bootstrapCurrentUserOrganization({ name: 'SLT' })).rejects.toThrow('Não foi possível criar a organização.')
  })

  it('treats a concurrent second bootstrap as ready when the context was created elsewhere', async () => {
    getAuthenticatedAccessStateMock.mockReset()
    rpcMock.mockReset()
    getAuthenticatedAccessStateMock
      .mockResolvedValueOnce({ kind: 'onboarding-required', userId: 'user-1', email: 'ana@example.com' })
      .mockResolvedValueOnce({ kind: 'ready', context: { id: 'user-1', organization_id: 10 } })
    createClientMock.mockResolvedValue({ rpc: rpcMock })
    rpcMock.mockResolvedValue({ data: null, error: { message: 'user already belongs to an organization' } })

    await expect(bootstrapCurrentUserOrganization({ name: 'SLT' })).resolves.toMatchObject({ kind: 'ready', context: { organization_id: 10 } })
  })
})
