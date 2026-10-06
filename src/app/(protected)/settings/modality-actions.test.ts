import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModalityDuplicateError } from '@/domain/modality-name'

const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), getUnit: vi.fn(), redirect: vi.fn((url: string): never => { throw new Error(`REDIRECT:${url}`) }), revalidate: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidate }))
vi.mock('@/services/modalities', () => ({ createModality: mocks.create, updateModality: mocks.update, updateModalityStatus: vi.fn() }))
vi.mock('@/services/organizations', () => ({ updateCurrentOrganization: vi.fn() }))
vi.mock('@/services/units', () => ({ getUnit: mocks.getUnit, createUnit: vi.fn(), setUnitAsMain: vi.fn(), updateUnit: vi.fn(), updateUnitStatus: vi.fn() }))
import { saveModality } from './actions'

describe('modality server action', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getUnit.mockResolvedValue({ id: 13 }) })
  it.each(['active', 'inactive'] as const)('routes %s duplicate messages for creation and editing', async (status) => {
    const form = new FormData(); form.set('name', 'natacao'); form.set('unit_id', '13'); form.set('description', '')
    mocks.create.mockRejectedValue(new ModalityDuplicateError(status))
    mocks.update.mockRejectedValue(new ModalityDuplicateError(status))
    await expect(saveModality(undefined, form)).rejects.toThrow(`REDIRECT:/settings/modalities?error=duplicate-${status}`)
    await expect(saveModality(12, form)).rejects.toThrow(`REDIRECT:/settings/modalities/12?error=duplicate-${status}`)
    expect(mocks.revalidate).not.toHaveBeenCalled()
  })
  it('never writes invalid form data', async () => {
    const form = new FormData(); form.set('name', ' '); form.set('unit_id', '13')
    await expect(saveModality(undefined, form)).rejects.toThrow('error=validation')
    expect(mocks.create).not.toHaveBeenCalled()
  })
})
