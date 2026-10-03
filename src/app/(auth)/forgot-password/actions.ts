'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getConfirmationRedirectUrl } from '@/lib/auth/confirmation-callback'
import { passwordRecoveryRequestSchema } from '@/validations/password-recovery'

export async function requestPasswordRecovery(formData: FormData) {
  const parsed = passwordRecoveryRequestSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) redirect('/forgot-password?error=validation')

  let redirectTo: string
  try {
    redirectTo = getConfirmationRedirectUrl((await headers()).get('origin') ?? '', 'recovery')
  } catch {
    redirect('/forgot-password?error=request')
  }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo })
  redirect('/forgot-password?sent=1')
}
