import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { getAuthenticatedAccessState } from '@/services/users'
import { organizationOnboardingSchema, type OrganizationOnboardingInput } from '@/validations/onboarding'

type BootstrapPayload = Database['public']['Functions']['bootstrap_organization_owner']['Args']

export function buildBootstrapOrganizationPayload(input: OrganizationOnboardingInput): BootstrapPayload {
  const parsed = organizationOnboardingSchema.parse(input)
  return {
    p_name: parsed.name,
    p_trade_name: parsed.trade_name,
    p_email: parsed.email,
    p_phone: parsed.phone,
  }
}

export async function bootstrapCurrentUserOrganization(input: OrganizationOnboardingInput) {
  const before = await getAuthenticatedAccessState()
  if (before.kind !== 'onboarding-required') return before

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('bootstrap_organization_owner', buildBootstrapOrganizationPayload(input))
  if (error || !data) {
    const afterFailure = await getAuthenticatedAccessState()
    if (afterFailure.kind === 'ready') return afterFailure
    throw new Error('Não foi possível criar a organização.')
  }

  const after = await getAuthenticatedAccessState()
  if (after.kind !== 'ready') throw new Error('Não foi possível confirmar a organização criada.')
  return after
}
