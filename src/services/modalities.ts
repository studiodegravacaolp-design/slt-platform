import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'

export type Modality = Tables<'modalities'>
export async function listModalities(unitId?: number): Promise<Modality[]> {
  const supabase = await createClient()
  let query = supabase.from('modalities').select('*').order('name')
  if (unitId !== undefined) query = query.eq('unit_id', unitId)
  const { data, error } = await query
  if (error) throw new Error('Não foi possível carregar as modalidades.')
  return data
}
