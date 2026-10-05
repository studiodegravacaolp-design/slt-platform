'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { bootstrapCurrentUserOrganization } from '@/services/onboarding'
import { getAuthenticatedAccessState } from '@/services/users'
import { organizationOnboardingSchema } from '@/validations/onboarding'
import type { OnboardingFormState } from '@/lib/onboarding/form-state'

function normalizeFormData(formData: FormData) {
  return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, typeof value === 'string' && value.trim() === '' ? undefined : value]))
}

function invalidState(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }): OnboardingFormState {
  return {
    status: 'error',
    message: 'Revise os campos destacados.',
    fieldErrors: Object.fromEntries(Object.entries(error.flatten().fieldErrors).filter(([, value]) => value !== undefined)) as Record<string, string[]>,
  }
}

export async function createOrganizationOnboardingAction(_: OnboardingFormState, formData: FormData): Promise<OnboardingFormState> {
  const access = await getAuthenticatedAccessState()
  if (access.kind === 'unauthenticated') redirect('/login')
  if (access.kind === 'ready') redirect('/home')

  const parsed = organizationOnboardingSchema.safeParse(normalizeFormData(formData))
  if (!parsed.success) return invalidState(parsed.error)

  try {
    const result = await bootstrapCurrentUserOrganization(parsed.data)
    if (result.kind === 'unauthenticated') redirect('/login')
    if (result.kind === 'ready') {
      revalidatePath('/home')
      redirect('/home')
    }
  } catch {
    return { status: 'error', message: 'Não foi possível criar sua organização. Tente novamente.' }
  }

  return { status: 'error', message: 'Não foi possível confirmar o contexto da organização.' }
}
