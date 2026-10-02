import { describe, expect, it } from 'vitest'
import { getRecoveryCallbackPayload } from './recovery-callback'

describe('getRecoveryCallbackPayload', () => {
  it('accepts a PKCE authorization code', () => {
    expect(getRecoveryCallbackPayload(new URLSearchParams({ code: 'authorization-code' }))).toEqual({ kind: 'code', value: 'authorization-code' })
  })

  it('accepts a recovery token hash but ignores arbitrary next values', () => {
    expect(getRecoveryCallbackPayload(new URLSearchParams({ token_hash: 'token-hash', type: 'recovery', next: 'https://untrusted.example' }))).toEqual({ kind: 'token_hash', value: 'token-hash' })
  })

  it('rejects token hashes for other recovery types', () => {
    expect(getRecoveryCallbackPayload(new URLSearchParams({ token_hash: 'token-hash', type: 'email' }))).toBeNull()
  })
})
