import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { getCurrentOrganizationId } from './organizations'
import { unitSchema, type UnitInput } from '@/validations/settings'

export type Unit = Tables<'units'>
export async function listUnits(): Promise<Unit[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('units').select('*').order('name')
  if (error) throw new Error('Não foi possível carregar as unidades.')
  return data
}
export async function getUnit(id: number): Promise<Unit> { const supabase = await createClient(); const { data, error } = await supabase.from('units').select('*').eq('id', id).single(); if (error) throw new Error('Unidade não encontrada.'); return data }
export async function createUnit(input: UnitInput): Promise<Unit> { const supabase = await createClient(); const organization_id = await getCurrentOrganizationId(); const { data, error } = await supabase.from('units').insert({ ...unitSchema.parse(input), organization_id }).select().single(); if (error) throw new Error('Não foi possível criar a unidade.'); return data }
export async function updateUnit(id: number, input: Partial<UnitInput>): Promise<Unit> { const supabase = await createClient(); const { data, error } = await supabase.from('units').update(unitSchema.partial().parse(input)).eq('id', id).select().single(); if (error) throw new Error('Não foi possível atualizar a unidade.'); return data }
