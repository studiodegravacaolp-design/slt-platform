import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { assertActiveModality } from '@/domain/operational-status'
import { modalitySchema, operationalStatusSchema, type ModalityInput } from '@/validations/settings'
import { getActiveUnit, getUnit, listActiveUnits, listUnits } from './units'

export type Modality = Tables<'modalities'>
export function assertModalityUnitUnchanged(currentUnitId: number, nextUnitId: number | undefined) { if (nextUnitId !== undefined && nextUnitId !== currentUnitId) throw new Error('A unidade da modalidade não pode ser alterada.') }
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
export async function listActiveModalities(unitId?: number): Promise<Modality[]> {
  const supabase = await createClient()
  const unitIds = unitId === undefined ? (await listActiveUnits()).map((unit) => unit.id) : [(await getActiveUnit(unitId)).id]
  if (!unitIds.length) return []
  const { data, error } = await supabase.from('modalities').select('*').in('unit_id', unitIds).eq('status', 'active').order('name')
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
export async function getActiveModality(id: number): Promise<Modality> { const modality = await getModality(id); assertActiveModality(modality.status); await getActiveUnit(modality.unit_id); return modality }
export async function createModality(input: ModalityInput): Promise<Modality> {
  const payload = modalitySchema.parse(input)
  await getActiveUnit(payload.unit_id)
  const supabase = await createClient()
  const { data, error } = await supabase.from('modalities').insert(payload).select().single()
  if (error) throw new Error('Não foi possível criar a modalidade.')
  return data
}
export async function updateModalityStatus(id: number, status: unknown): Promise<Modality> { return updateModality(id, { status: operationalStatusSchema.parse(status) }) }
export async function updateModality(id: number, input: Partial<ModalityInput>): Promise<Modality> {
  const current = await getModality(id)
  const payload = modalitySchema.partial().parse(input)
  assertModalityUnitUnchanged(current.unit_id, payload.unit_id)
  const supabase = await createClient()
  const { data, error } = await supabase.from('modalities').update(payload).eq('id', id).select().single()
  if (error) throw new Error('Não foi possível atualizar a modalidade.')
  return data
}
