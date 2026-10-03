import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignupForm } from '@/components/auth/signup-form'
import { getAuthenticatedAccessState } from '@/services/users'
import { getSignupDestination } from '@/lib/auth/signup'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const state = await getAuthenticatedAccessState()
  const destination = getSignupDestination(state)
  if (destination) redirect(destination)
  const params = await searchParams

  return <main className="login"><div className="onboarding-card">{params.error === 'confirmation' && <p className="form-error" role="alert">Não foi possível confirmar a conta. Solicite um novo cadastro e tente novamente.</p>}<SignupForm /><Link href="/login">Já tenho uma conta</Link></div></main>
}
