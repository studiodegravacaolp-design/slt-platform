import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'

export type Organization = Tables<'organizations'>

/** Resolves context on the server; RLS remains the authorization boundary. */
export async function getCurrentOrganizationId(): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('current_user_organization_id')
  if (error || data === null) throw new Error('A organização do usuário autenticado não foi encontrada.')
  return data
}

export async function getCurrentOrganization(): Promise<Organization> {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  const { data, error } = await supabase.from('organizations').select('*').eq('id', organizationId).single()
  if (error) throw new Error('Não foi possível carregar a organização atual.')
  return data
}
