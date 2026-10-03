import { NextResponse, type NextRequest } from 'next/server'
import { getConfirmationDestination, getConfirmationErrorDestination, getConfirmationPayload } from '@/lib/auth/confirmation-callback'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const payload = getConfirmationPayload(requestUrl.searchParams)

  if (payload) {
    const supabase = await createClient()
    const { error } = payload.kind === 'code'
      ? await supabase.auth.exchangeCodeForSession(payload.value)
      : await supabase.auth.verifyOtp({ token_hash: payload.value, type: payload.flow })
    if (!error) return NextResponse.redirect(new URL(getConfirmationDestination(payload.flow), requestUrl.origin))
    return NextResponse.redirect(new URL(getConfirmationErrorDestination(payload.flow), requestUrl.origin))
  }

  return NextResponse.redirect(new URL('/forgot-password?error=recovery', requestUrl.origin))
}
