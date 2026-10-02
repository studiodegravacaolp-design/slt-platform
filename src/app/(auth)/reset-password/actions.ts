'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { passwordUpdateSchema } from '@/validations/password'

export async function resetPassword(formData: FormData) {
  const parsed = passwordUpdateSchema.safeParse({ password: formData.get('password'), password_confirmation: formData.get('password_confirmation') })
  if (!parsed.success) redirect('/reset-password?error=validation')

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  if (claimsError || !claimsData?.claims) redirect('/forgot-password?error=recovery')

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) redirect('/reset-password?error=update')

  await supabase.auth.signOut()
  redirect('/login?password_reset=1')
}
