import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { assertActiveModality } from '@/domain/operational-status'
import { isModalityUniqueViolation, ModalityDuplicateError, normalizeModalityName } from '@/domain/modality-name'
import { modalitySchema, operationalStatusSchema, type ModalityInput } from '@/validations/settings'
import { getActiveUnit, getUnit, listActiveUnits, listUnits } from './units'

export type Modality = Tables<'modalities'>
async function assertNoEquivalentModality(unitId: number, name: string, excludeId?: number) {
  const supabase = await createClient()
  let query = supabase.from('modalities').select('id, status').eq('unit_id', unitId).eq('name_key', normalizeModalityName(name))
  if (excludeId !== undefined) query = query.neq('id', excludeId)
  const { data, error } = await query.maybeSingle()
  if (error) throw new Error('Não foi possível verificar a modalidade existente.')
  if (data) throw new ModalityDuplicateError(data.status === 'inactive' ? 'inactive' : 'active')
}

async function handleModalityWriteError(error: { code?: string; message?: string }, unitId: number, name: string, message: string, excludeId?: number): Promise<never> {
  if (isModalityUniqueViolation(error)) await assertNoEquivalentModality(unitId, name, excludeId)
  throw new Error(message)
}
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
  await assertNoEquivalentModality(payload.unit_id, payload.name)
  const supabase = await createClient()
  const { data, error } = await supabase.from('modalities').insert(payload).select().single()
  if (error) await handleModalityWriteError(error, payload.unit_id, payload.name, 'Não foi possível criar a modalidade.')
  if (!data) throw new Error('Não foi possível criar a modalidade.')
  return data
}
export async function updateModalityStatus(id: number, status: unknown): Promise<Modality> { return updateModality(id, { status: operationalStatusSchema.parse(status) }) }
export async function updateModality(id: number, input: Partial<ModalityInput>): Promise<Modality> {
  const current = await getModality(id)
  const payload = modalitySchema.partial().parse(input)
  assertModalityUnitUnchanged(current.unit_id, payload.unit_id)
  if (payload.name !== undefined) await assertNoEquivalentModality(current.unit_id, payload.name, id)
  const supabase = await createClient()
  const { data, error } = await supabase.from('modalities').update(payload).eq('id', id).select().single()
  if (error) await handleModalityWriteError(error, current.unit_id, payload.name ?? current.name, 'Não foi possível atualizar a modalidade.', id)
  if (!data) throw new Error('Não foi possível atualizar a modalidade.')
  return data
}
