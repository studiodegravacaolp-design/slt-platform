import { NextResponse, type NextRequest } from 'next/server'
import { getRecoveryCallbackPayload } from '@/lib/auth/recovery-callback'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const payload = getRecoveryCallbackPayload(requestUrl.searchParams)

  if (payload) {
    const supabase = await createClient()
    const { error } = payload.kind === 'code'
      ? await supabase.auth.exchangeCodeForSession(payload.value)
      : await supabase.auth.verifyOtp({ token_hash: payload.value, type: 'recovery' })
    if (!error) return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
  }

  return NextResponse.redirect(new URL('/forgot-password?error=recovery', requestUrl.origin))
}
