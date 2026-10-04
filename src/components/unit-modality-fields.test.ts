import { describe, expect, it } from 'vitest'
import { modalitiesForUnit } from './unit-modality-fields'

describe('modalitiesForUnit', () => {
  const modalities = [{ id: 1, name: 'Natação', unit_id: 10 }, { id: 2, name: 'Pilates', unit_id: 20 }]

  it('shows only modalities belonging to the selected unit', () => {
    expect(modalitiesForUnit(modalities, '10')).toEqual([modalities[0]])
  })

  it('clears the available choices when the selected unit changes', () => {
    expect(modalitiesForUnit(modalities, '20')).toEqual([modalities[1]])
    expect(modalitiesForUnit(modalities, '')).toEqual([])
  })
})
