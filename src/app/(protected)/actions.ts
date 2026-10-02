'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Ends only the current authenticated Supabase session. */
export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) redirect('/login?error=logout')
  redirect('/login')
}
