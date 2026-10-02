import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { getCurrentOrganizationId } from './organizations'
import { userProfileUpdateSchema, type UserProfileUpdateInput } from '@/validations/user-profile'

export type PublicUser = Tables<'users'>
export type AuthenticatedUserContext = Pick<PublicUser, 'id' | 'organization_id' | 'name' | 'email' | 'phone' | 'avatar' | 'status' | 'last_access_at'>

export function buildAuthenticatedUserContext(user: PublicUser, authUserId: string, organizationId: number): AuthenticatedUserContext {
  if (user.id !== authUserId) throw new Error('Usuário autenticado inválido.')
  if (user.organization_id !== organizationId) throw new Error('Contexto organizacional inválido.')
  return { id: user.id, organization_id: user.organization_id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, status: user.status, last_access_at: user.last_access_at }
}

/** Resolves the authenticated professional without trusting client input or user_metadata. */
export async function getCurrentUserContext(): Promise<AuthenticatedUserContext> {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const authUserId = claimsData?.claims.sub
  if (claimsError || typeof authUserId !== 'string') throw new Error('Sessão autenticada não encontrada.')
  const organizationId = await getCurrentOrganizationId()
  const { data: user, error } = await supabase.from('users').select('*').eq('id', authUserId).single()
  if (error || !user) throw new Error('Usuário profissional não encontrado.')
  return buildAuthenticatedUserContext(user, authUserId, organizationId)
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
