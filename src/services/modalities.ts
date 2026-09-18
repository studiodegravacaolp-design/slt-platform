import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { modalitySchema, type ModalityInput } from '@/validations/settings'

export type Modality = Tables<'modalities'>
export async function listModalities(unitId?: number): Promise<Modality[]> {
  const supabase = await createClient()
  let query = supabase.from('modalities').select('*').order('name')
  if (unitId !== undefined) query = query.eq('unit_id', unitId)
  const { data, error } = await query
  if (error) throw new Error('Não foi possível carregar as modalidades.')
  return data
}
export async function createModality(input: ModalityInput): Promise<Modality> { const supabase = await createClient(); const { data, error } = await supabase.from('modalities').insert(modalitySchema.parse(input)).select().single(); if (error) throw new Error('Não foi possível criar a modalidade.'); return data }
export async function updateModality(id: number, input: Partial<ModalityInput>): Promise<Modality> { const supabase = await createClient(); const { data, error } = await supabase.from('modalities').update(modalitySchema.partial().parse(input)).eq('id', id).select().single(); if (error) throw new Error('Não foi possível atualizar a modalidade.'); return data }
