import { redirect } from 'next/navigation'
import { OrganizationOnboardingForm } from '@/components/onboarding/organization-onboarding-form'
import { getAuthenticatedAccessState } from '@/services/users'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const state = await getAuthenticatedAccessState()
  if (state.kind === 'unauthenticated') redirect('/login')
  if (state.kind === 'ready') redirect('/home')

  return <main className="login"><div className="onboarding-card"><p className="eyebrow">SLT Platform</p><h1>Configure sua organização</h1><p>Vamos preparar seu espaço no SLT para você começar.</p><OrganizationOnboardingForm email={state.email} /></div></main>
}
