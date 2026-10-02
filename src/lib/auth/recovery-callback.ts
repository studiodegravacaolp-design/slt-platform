export type RecoveryCallbackPayload =
  | { kind: 'code'; value: string }
  | { kind: 'token_hash'; value: string }
  | null

/** Extracts only Supabase's supported password-recovery callback values. */
export function getRecoveryCallbackPayload(searchParams: URLSearchParams): RecoveryCallbackPayload {
  const code = searchParams.get('code')
  if (code) return { kind: 'code', value: code }

  const tokenHash = searchParams.get('token_hash')
  if (tokenHash && searchParams.get('type') === 'recovery') return { kind: 'token_hash', value: tokenHash }

  return null
}
