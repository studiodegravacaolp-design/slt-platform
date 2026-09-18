import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'

export type Unit = Tables<'units'>
export async function listUnits(): Promise<Unit[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('units').select('*').order('name')
  if (error) throw new Error('Não foi possível carregar as unidades.')
  return data
}
