'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getConfirmationRedirectUrl } from '@/lib/auth/confirmation-callback'
import { buildSignupRequest } from '@/lib/auth/signup'
import { signupSchema } from '@/validations/signup'

export type SignupFormState = { status: 'idle' | 'success' | 'error'; message?: string; fieldErrors?: Record<string, string[]> }
export const initialSignupFormState: SignupFormState = { status: 'idle' }

function normalizeFormData(formData: FormData) {
  return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, typeof value === 'string' && (key === 'name' || key === 'email') ? value.trim() : value]))
}

export async function signUp(_: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const parsed = signupSchema.safeParse(normalizeFormData(formData))
  if (!parsed.success) {
    return { status: 'error', message: 'Revise os campos destacados.', fieldErrors: Object.fromEntries(Object.entries(parsed.error.flatten().fieldErrors).filter(([, value]) => value !== undefined)) as Record<string, string[]> }
  }

  let emailRedirectTo: string
  try { emailRedirectTo = getConfirmationRedirectUrl((await headers()).get('origin') ?? '', 'signup') } catch {
    return { status: 'error', message: 'Não foi possível iniciar o cadastro. Tente novamente.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp(buildSignupRequest(parsed.data, emailRedirectTo))
  if (error) return { status: 'error', message: 'Não foi possível concluir o cadastro. Tente novamente.' }

  return { status: 'success', message: 'Se o endereço puder receber a confirmação, enviaremos um e-mail para continuar o cadastro.' }
}
