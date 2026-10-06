import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModalityDuplicateError } from '@/domain/modality-name'

const mocks = vi.hoisted(() => {
  const maybeSingle = vi.fn()
  const single = vi.fn()
  const eq = vi.fn()
  const neq = vi.fn()
  const select = vi.fn()
  const insert = vi.fn()
  const update = vi.fn()
  const from = vi.fn()
  const getUnit = vi.fn()
  const getActiveUnit = vi.fn()
  return { maybeSingle, single, eq, neq, select, insert, update, from, getUnit, getActiveUnit }
})
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ from: mocks.from }) }))
vi.mock('./units', () => ({ getUnit: mocks.getUnit, getActiveUnit: mocks.getActiveUnit, listUnits: vi.fn(), listActiveUnits: vi.fn() }))
import { createModality, updateModality, updateModalityStatus } from './modalities'

const record = { id: 12, unit_id: 13, name: 'Natação', name_key: 'natacao', status: 'active' }
const conflict = { code: '23505', message: 'duplicate key violates unique constraint "modalities_unit_name_key_key"' }

describe('modality writes', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    const query = { select: mocks.select, insert: mocks.insert, update: mocks.update, eq: mocks.eq, neq: mocks.neq, single: mocks.single, maybeSingle: mocks.maybeSingle }
    for (const method of [mocks.from, mocks.select, mocks.insert, mocks.update, mocks.eq, mocks.neq]) method.mockReturnValue(query)
    mocks.getUnit.mockResolvedValue({ id: 13, organization_id: 15, status: 'active' })
    mocks.getActiveUnit.mockResolvedValue({ id: 13, organization_id: 15, status: 'active' })
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null })
    mocks.single.mockResolvedValue({ data: record, error: null })
  })
  it('canonicalizes before writing without trusting a supplied comparison key', async () => {
    await createModality({ name: ' NATACAO ', unit_id: 13, name_key: 'forged' } as Parameters<typeof createModality>[0])
    expect(mocks.insert).toHaveBeenCalledWith({ name: 'Natação', unit_id: 13 })
    expect(mocks.eq).toHaveBeenCalledWith('name_key', 'natacao')
    expect(mocks.getActiveUnit).toHaveBeenCalledWith(13)
  })
  it.each(['natacao', 'Natacao', 'NATACAO', 'natação', 'Natação', 'NATAÇÃO'])('creates %s with the official name and technical key kept separate', async (name) => {
    const result = await createModality({ name, unit_id: 13 })
    expect(mocks.insert).toHaveBeenCalledWith({ name: 'Natação', unit_id: 13 })
    expect(mocks.eq).toHaveBeenCalledWith('name_key', 'natacao')
    expect(result).toMatchObject({ name: 'Natação', name_key: 'natacao' })
  })
  it.each(['natacao', 'Natacao', 'NATACAO', 'natação', 'Natação', 'NATAÇÃO'])('edits %s with the official name and technical key kept separate', async (name) => {
    mocks.single.mockResolvedValueOnce({ data: { ...record, name: 'Outra', name_key: 'outra' }, error: null }).mockResolvedValueOnce({ data: record, error: null })
    const result = await updateModality(12, { name })
    expect(mocks.update).toHaveBeenCalledWith({ name: 'Natação' })
    expect(mocks.eq).toHaveBeenCalledWith('name_key', 'natacao')
    expect(result).toMatchObject({ name: 'Natação', name_key: 'natacao' })
  })
  it.each(['active', 'inactive'] as const)('rejects an existing %s modality without inserting', async (status) => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: 11, status }, error: null })
    await expect(createModality({ name: 'natacao', unit_id: 13 })).rejects.toEqual(new ModalityDuplicateError(status))
    expect(mocks.insert).not.toHaveBeenCalled()
  })
  it.each(['active', 'inactive'] as const)('translates a concurrent unique violation using the winning %s record', async (status) => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({ data: { id: 11, status }, error: null })
    mocks.single.mockResolvedValue({ data: null, error: conflict })
    await expect(createModality({ name: 'Natacao', unit_id: 13 })).rejects.toEqual(new ModalityDuplicateError(status))
    expect(mocks.insert).toHaveBeenCalledOnce()
    expect(mocks.eq).toHaveBeenCalledWith('unit_id', 13)
  })
  it('does not mistake a different unique constraint for a name conflict', async () => {
    mocks.single.mockResolvedValue({ data: null, error: { ...conflict, message: 'modalities_pkey' } })
    await expect(createModality({ name: 'Natação', unit_id: 13 })).rejects.toThrow('Não foi possível criar a modalidade.')
    expect(mocks.maybeSingle).toHaveBeenCalledOnce()
  })
  it('rejects conflicting renames and excludes the edited record', async () => {
    mocks.single.mockResolvedValue({ data: { ...record, name: 'Outra' }, error: null })
    mocks.maybeSingle.mockResolvedValue({ data: { id: 11, status: 'active' }, error: null })
    await expect(updateModality(12, { name: 'Natacao' })).rejects.toThrow(ModalityDuplicateError)
    expect(mocks.neq).toHaveBeenCalledWith('id', 12)
    expect(mocks.update).not.toHaveBeenCalled()
  })
  it('translates a race during rename too', async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({ data: { id: 11, status: 'inactive' }, error: null })
    mocks.single.mockResolvedValueOnce({ data: record, error: null }).mockResolvedValueOnce({ data: null, error: conflict })
    await expect(updateModality(12, { name: 'natacao' })).rejects.toEqual(new ModalityDuplicateError('inactive'))
  })
  it('allows the same key in another authorized unit', async () => {
    await createModality({ name: 'natacao', unit_id: 14 })
    expect(mocks.getActiveUnit).toHaveBeenCalledWith(14)
    expect(mocks.eq).toHaveBeenCalledWith('unit_id', 14)
    expect(mocks.insert).toHaveBeenCalledOnce()
  })
  it('rejects a foreign unit before looking up names or writing', async () => {
    mocks.getActiveUnit.mockRejectedValue(new Error('Unidade não encontrada.'))
    await expect(createModality({ name: 'natacao', unit_id: 999 })).rejects.toThrow('Unidade não encontrada.')
    expect(mocks.from).not.toHaveBeenCalled()
  })
  it('validates the current unit before editing or disclosing duplicate status', async () => {
    mocks.getUnit.mockRejectedValue(new Error('Unidade não encontrada.'))
    await expect(updateModality(12, { name: 'natacao' })).rejects.toThrow('Unidade não encontrada.')
    expect(mocks.maybeSingle).not.toHaveBeenCalled()
    expect(mocks.update).not.toHaveBeenCalled()
  })
  it('changes status without overwriting name or description', async () => {
    await updateModalityStatus(12, 'inactive')
    expect(mocks.update).toHaveBeenCalledWith({ status: 'inactive' })
  })
  it('fails closed if the duplicate lookup fails', async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { message: 'RLS error' } })
    await expect(createModality({ name: 'natacao', unit_id: 13 })).rejects.toThrow('Não foi possível verificar a modalidade existente.')
    expect(mocks.insert).not.toHaveBeenCalled()
  })
})
