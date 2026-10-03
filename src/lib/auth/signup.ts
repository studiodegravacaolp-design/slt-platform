import { signupSchema, type SignupInput } from '@/validations/signup'
import type { AuthenticatedAccessState } from '@/services/users'

export function buildSignupRequest(input: SignupInput, emailRedirectTo: string) {
  const parsed = signupSchema.parse(input)
  return {
    email: parsed.email,
    password: parsed.password,
    options: {
      data: { name: parsed.name },
      emailRedirectTo,
    },
  }
}

export function getSignupDestination(state: AuthenticatedAccessState) {
  if (state.kind === 'onboarding-required') return '/onboarding'
  if (state.kind === 'ready') return '/home'
  return null
}
