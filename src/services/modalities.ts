import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { modalitySchema, type ModalityInput } from '@/validations/settings'
import { getUnit, listUnits } from './units'

export type Modality = Tables<'modalities'>
export async function listModalities(unitId?: number): Promise<Modality[]> {
  const supabase = await createClient()
  const unitIds = unitId === undefined
    ? (await listUnits()).map((unit) => unit.id)
    : [(await getUnit(unitId)).id]
  if (!unitIds.length) return []
  const { data, error } = await supabase.from('modalities').select('*').in('unit_id', unitIds).order('name')
  if (error) throw new Error('Não foi possível carregar as modalidades.')
  return data
}
export async function getModality(id: number): Promise<Modality> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('modalities').select('*').eq('id', id).single()
  if (error || !data) throw new Error('Modalidade não encontrada.')
  await getUnit(data.unit_id)
  return data
}
export async function createModality(input: ModalityInput): Promise<Modality> {
  const payload = modalitySchema.parse(input)
  await getUnit(payload.unit_id)
  const supabase = await createClient()
  const { data, error } = await supabase.from('modalities').insert(payload).select().single()
  if (error) throw new Error('Não foi possível criar a modalidade.')
  return data
}
export async function updateModality(id: number, input: Partial<ModalityInput>): Promise<Modality> {
  const current = await getModality(id)
  const payload = modalitySchema.partial().parse(input)
  if (payload.unit_id !== undefined && payload.unit_id !== current.unit_id) throw new Error('A unidade da modalidade não pode ser alterada.')
  const supabase = await createClient()
  const { data, error } = await supabase.from('modalities').update(payload).eq('id', id).select().single()
  if (error) throw new Error('Não foi possível atualizar a modalidade.')
  return data
}
