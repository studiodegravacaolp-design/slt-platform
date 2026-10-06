import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { modalityDuplicateMessages } from '@/domain/modality-name'

const mocks = vi.hoisted(() => {
  const modality = { id: 12, unit_id: 13, name: 'Natação', name_key: 'natacao', description: null, status: 'active' }
  const unit = { id: 13, name: 'Unidade Centro' }
  return { modality, unit, listModalities: vi.fn(), getModality: vi.fn() }
})
vi.mock('@/services/modalities', () => ({ listModalities: mocks.listModalities, getModality: mocks.getModality }))
vi.mock('@/services/units', () => ({ listUnits: async () => [mocks.unit], listActiveUnits: async () => [mocks.unit], getUnit: async () => mocks.unit }))
vi.mock('../actions', () => ({ saveModality: async () => {}, changeModalityStatus: async () => {} }))
import ModalitiesPage from './page'
import ModalityPage from './[id]/page'

describe('canonical modality presentation', () => {
  beforeEach(() => {
    mocks.listModalities.mockResolvedValue([mocks.modality])
    mocks.getModality.mockResolvedValue(mocks.modality)
  })
  it('renders the official name in the listing without exposing the comparison key', async () => {
    const markup = renderToStaticMarkup(await ModalitiesPage({ searchParams: Promise.resolve({}) }))
    expect(markup).toContain('<strong>Natação</strong>')
    expect(markup).not.toContain('natacao')
    expect(markup).not.toContain('name_key')
  })
  it('uses the official name for the editing title and name input', async () => {
    const markup = renderToStaticMarkup(await ModalityPage({ params: Promise.resolve({ id: '12' }), searchParams: Promise.resolve({}) }))
    expect(markup).toContain('<h1>Natação</h1>')
    expect(markup).toContain('value="Natação"')
    expect(markup).not.toContain('natacao')
    expect(markup).not.toContain('name_key')
  })
  it.each(['active', 'inactive'] as const)('keeps the approved %s duplicate message free of technical keys', async (status) => {
    const markup = renderToStaticMarkup(await ModalitiesPage({ searchParams: Promise.resolve({ error: `duplicate-${status}` }) }))
    expect(markup).toContain(modalityDuplicateMessages[status])
    expect(markup).toContain('<strong>Natação</strong>')
    expect(markup).not.toContain('natacao')
  })
})
