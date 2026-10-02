import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { getCurrentOrganizationId } from './organizations'
import { userProfileUpdateSchema, type UserProfileUpdateInput } from '@/validations/user-profile'

export type PublicUser = Tables<'users'>
export type AuthenticatedUserContext = Pick<PublicUser, 'id' | 'organization_id' | 'name' | 'email' | 'phone' | 'avatar' | 'status' | 'last_access_at'>
export type AuthenticatedAccessState =
  | { kind: 'unauthenticated' }
  | { kind: 'onboarding-required'; userId: string; email: string | null }
  | { kind: 'ready'; context: AuthenticatedUserContext }

export class OnboardingRequiredError extends Error {
  constructor() { super('O usuário autenticado precisa concluir o onboarding.') }
}

export function buildAuthenticatedUserContext(user: PublicUser, authUserId: string, organizationId: number): AuthenticatedUserContext {
  if (user.id !== authUserId) throw new Error('Usuário autenticado inválido.')
  if (user.organization_id !== organizationId) throw new Error('Contexto organizacional inválido.')
  return { id: user.id, organization_id: user.organization_id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, status: user.status, last_access_at: user.last_access_at }
}

export function resolveAuthenticatedAccessState({ authUserId, authEmail = null, user, organizationId }: { authUserId: string | null; authEmail?: string | null; user: PublicUser | null; organizationId?: number }): AuthenticatedAccessState {
  if (!authUserId) return { kind: 'unauthenticated' }
  if (!user) return { kind: 'onboarding-required', userId: authUserId, email: authEmail }
  if (organizationId === undefined) throw new Error('A organização do usuário autenticado não foi encontrada.')
  return { kind: 'ready', context: buildAuthenticatedUserContext(user, authUserId, organizationId) }
}

/** Resolves session, professional record, and organization without treating onboarding as an auth failure. */
export async function getAuthenticatedAccessState(): Promise<AuthenticatedAccessState> {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const authUserId = claimsError || typeof claimsData?.claims.sub !== 'string' ? null : claimsData.claims.sub
  if (!authUserId) return { kind: 'unauthenticated' }

  const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', authUserId).maybeSingle()
  if (userError) throw new Error('Não foi possível validar o contexto do usuário.')

  if (!user) {
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser()
    if (authUserError || authUserData.user?.id !== authUserId) throw new Error('Sessão autenticada não encontrada.')
    return resolveAuthenticatedAccessState({ authUserId, authEmail: authUserData.user.email ?? null, user: null })
  }

  const organizationId = await getCurrentOrganizationId()
  return resolveAuthenticatedAccessState({ authUserId, user, organizationId })
}

/** Resolves the authenticated professional without trusting client input or user_metadata. */
export async function getCurrentUserContext(): Promise<AuthenticatedUserContext> {
  const state = await getAuthenticatedAccessState()
  if (state.kind === 'unauthenticated') throw new Error('Sessão autenticada não encontrada.')
  if (state.kind === 'onboarding-required') throw new OnboardingRequiredError()
  return state.context
}

/** Updates only the current professional's permitted profile fields. */
export async function updateCurrentUserProfile(input: UserProfileUpdateInput): Promise<AuthenticatedUserContext> {
  const payload = userProfileUpdateSchema.parse(input)
  const context = await getCurrentUserContext()
  const supabase = await createClient()
  const { data: user, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', context.id)
    .eq('organization_id', context.organization_id)
    .select('*')
    .single()
  if (error || !user) throw new Error('Não foi possível atualizar o perfil.')
  return buildAuthenticatedUserContext(user, context.id, context.organization_id)
}
