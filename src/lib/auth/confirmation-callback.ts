export type ConfirmationFlow = 'recovery' | 'signup'

export type ConfirmationPayload =
  | { flow: ConfirmationFlow; kind: 'code'; value: string }
  | { flow: 'recovery'; kind: 'token_hash'; value: string }
  | { flow: 'signup'; kind: 'token_hash'; value: string }
  | null

const allowedFlows = new Set<ConfirmationFlow>(['recovery', 'signup'])

export function getConfirmationRedirectUrl(origin: string, flow: ConfirmationFlow) {
  const url = new URL(origin)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Invalid origin')
  url.pathname = '/auth/confirm'
  url.search = ''
  url.searchParams.set('flow', flow)
  return url.toString()
}

/** Accepts only internal, explicit confirmation flows; it never reads a user-provided destination. */
export function getConfirmationPayload(searchParams: URLSearchParams): ConfirmationPayload {
  const requestedFlow = searchParams.get('flow')
  const flow = allowedFlows.has(requestedFlow as ConfirmationFlow) ? requestedFlow as ConfirmationFlow : 'recovery'
  const code = searchParams.get('code')
  if (code) return { flow, kind: 'code', value: code }

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  if (!tokenHash) return null
  if (type === 'recovery') return { flow: 'recovery', kind: 'token_hash', value: tokenHash }
  if (type === 'signup') return { flow: 'signup', kind: 'token_hash', value: tokenHash }
  return null
}

export function getConfirmationDestination(flow: ConfirmationFlow) {
  return flow === 'signup' ? '/onboarding' : '/reset-password'
}

export function getConfirmationErrorDestination(flow: ConfirmationFlow) {
  return flow === 'signup' ? '/signup?error=confirmation' : '/forgot-password?error=recovery'
}
