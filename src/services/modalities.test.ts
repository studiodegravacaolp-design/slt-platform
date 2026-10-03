import { describe, expect, it } from 'vitest'
import { assertModalityUnitUnchanged } from './modalities'

describe('modality integrity', () => {
  it('preserves the modality unit after creation', () => {
    expect(() => assertModalityUnitUnchanged(1, 1)).not.toThrow()
    expect(() => assertModalityUnitUnchanged(1, undefined)).not.toThrow()
    expect(() => assertModalityUnitUnchanged(1, 2)).toThrow('A unidade da modalidade não pode ser alterada.')
  })
})
