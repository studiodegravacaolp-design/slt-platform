'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { passwordRecoveryRequestSchema } from '@/validations/password-recovery'

function getRecoveryRedirectUrl(origin: string) {
  const url = new URL(origin)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Invalid origin')
  url.pathname = '/auth/confirm'
  url.search = ''
  url.searchParams.set('next', '/reset-password')
  return url.toString()
}

export async function requestPasswordRecovery(formData: FormData) {
  const parsed = passwordRecoveryRequestSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) redirect('/forgot-password?error=validation')

  let redirectTo: string
  try {
    redirectTo = getRecoveryRedirectUrl((await headers()).get('origin') ?? '')
  } catch {
    redirect('/forgot-password?error=request')
  }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo })
  redirect('/forgot-password?sent=1')
}
