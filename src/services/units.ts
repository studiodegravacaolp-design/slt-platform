import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { getCurrentOrganizationId } from './organizations'
import { unitSchema, type UnitInput } from '@/validations/settings'

export type Unit = Tables<'units'>
export async function listUnits(): Promise<Unit[]> {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  const { data, error } = await supabase.from('units').select('*').eq('organization_id', organizationId).order('name')
  if (error) throw new Error('Não foi possível carregar as unidades.')
  return data
}
export async function getUnit(id: number): Promise<Unit> { const supabase = await createClient(); const organizationId = await getCurrentOrganizationId(); const { data, error } = await supabase.from('units').select('*').eq('id', id).eq('organization_id', organizationId).single(); if (error) throw new Error('Unidade não encontrada.'); return data }
export async function createUnit(input: UnitInput): Promise<Unit> { const supabase = await createClient(); const organization_id = await getCurrentOrganizationId(); const { data, error } = await supabase.from('units').insert({ ...unitSchema.parse(input), organization_id }).select().single(); if (error) throw new Error('Não foi possível criar a unidade.'); return data }
export async function updateUnit(id: number, input: Partial<UnitInput>): Promise<Unit> { const supabase = await createClient(); const organizationId = await getCurrentOrganizationId(); const { data, error } = await supabase.from('units').update(unitSchema.partial().parse(input)).eq('id', id).eq('organization_id', organizationId).select().single(); if (error) throw new Error('Não foi possível atualizar a unidade.'); return data }

/** Transfers the primary-unit flag within the authenticated organization only. */
export async function setUnitAsMain(id: number): Promise<Unit> {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  const { data: target, error: targetError } = await supabase.from('units').select('*').eq('id', id).eq('organization_id', organizationId).single()
  if (targetError || !target) throw new Error('Unidade não encontrada.')
  if (target.is_main) return target

  const { data: currentMain, error: currentMainError } = await supabase.from('units').select('*').eq('organization_id', organizationId).eq('is_main', true).maybeSingle()
  if (currentMainError) throw new Error('Não foi possível localizar a unidade principal.')

  if (currentMain) {
    const { error } = await supabase.from('units').update({ is_main: false }).eq('id', currentMain.id).eq('organization_id', organizationId)
    if (error) throw new Error('Não foi possível atualizar a unidade principal.')
  }

  const { data, error } = await supabase.from('units').update({ is_main: true }).eq('id', id).eq('organization_id', organizationId).select().single()
  if (!error && data) return data

  if (currentMain) await supabase.from('units').update({ is_main: true }).eq('id', currentMain.id).eq('organization_id', organizationId)
  throw new Error('Não foi possível definir a unidade principal.')
}
