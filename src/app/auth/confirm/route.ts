import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  if (tokenHash && type === 'recovery') {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
    if (!error) return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
  }

  return NextResponse.redirect(new URL('/forgot-password?error=recovery', requestUrl.origin))
}
