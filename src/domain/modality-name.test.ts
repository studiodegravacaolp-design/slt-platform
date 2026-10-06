import { describe, expect, it } from 'vitest'
import { canonicalizeModalityName, cleanModalityName, isModalityUniqueViolation, ModalityDuplicateError, modalityDiacritics, modalityWhitespace, normalizeModalityName } from './modality-name'
import { modalitySchema } from '@/validations/settings'

describe('modality names', () => {
  it.each(['natacao', 'Natacao', 'NATACAO', 'natação', 'Natação', 'NATAÇÃO', ' natacao ', 'Natac\u0327a\u0303o'])('canonicalizes %s explicitly', (name) => {
    expect({ name: canonicalizeModalityName(name), name_key: normalizeModalityName(name) }).toEqual({ name: 'Natação', name_key: 'natacao' })
    expect(normalizeModalityName(name)).toBe('natacao')
    expect(canonicalizeModalityName(name)).toBe('Natação')
    expect(modalitySchema.parse({ name, unit_id: 13 }).name).toBe('Natação')
  })
  it('collapses every supported whitespace character identically', () => {
    for (const space of modalityWhitespace) {
      expect(cleanModalityName(`${space}A${space}${space}B${space}`)).toBe('A B')
    }
  })
  it('removes only the approved combining diacritics from comparison', () => {
    for (const mark of modalityDiacritics) expect(normalizeModalityName(`A${mark}`)).toBe('a')
    expect(normalizeModalityName('a\u0338')).toBe('a\u0338')
    expect(normalizeModalityName('ÓLEO')).toBe('oleo')
  })
  it('preserves unknown spelling, punctuation and meaningful word boundaries', () => {
    expect(canonicalizeModalityName('  Minha\t\tMODALIDADE – X  ')).toBe('Minha MODALIDADE – X')
    expect(canonicalizeModalityName('constructor')).toBe('constructor')
    expect(normalizeModalityName('Nata-ção')).toBe('nata-cao')
    expect(normalizeModalityName('Nata  ção')).toBe('nata cao')
    expect(canonicalizeModalityName('Natacãozinha')).toBe('Natacãozinha')
  })
  it('normalizes canonical Unicode equivalents without compatibility folding', () => {
    expect(normalizeModalityName('Tênis')).toBe(normalizeModalityName('Te\u0302nis'))
    expect(normalizeModalityName('①')).toBe('①')
    expect(normalizeModalityName('Æ')).toBe('æ')
    expect(normalizeModalityName('ΜΆΘΗΜΑ')).toBe(normalizeModalityName('μάθημα'))
    expect(normalizeModalityName('ФУТБОЛ')).toBe(normalizeModalityName('футбол'))
    expect(normalizeModalityName('Σ')).toBe(normalizeModalityName('ς'))
  })
  it('rejects names that become empty comparison keys', () => {
    for (const name of ['', '\u00a0\t ', '\u0301']) expect(() => modalitySchema.parse({ name, unit_id: 13 })).toThrow()
  })
  it('recognizes only the named modality unique constraint', () => {
    expect(isModalityUniqueViolation({ code: '23505', message: 'duplicate key violates unique constraint "modalities_unit_name_key_key"' })).toBe(true)
    expect(isModalityUniqueViolation({ code: '23505', message: 'modalities_pkey' })).toBe(false)
    expect(isModalityUniqueViolation({ code: '42501', message: 'modalities_unit_name_key_key' })).toBe(false)
  })
  it('returns the approved active and inactive domain messages', () => {
    expect(new ModalityDuplicateError('active').message).toBe('Esta modalidade já existe nesta unidade.')
    expect(new ModalityDuplicateError('inactive').message).toBe('Esta modalidade já existe nesta unidade e está inativa. Reative o cadastro existente.')
  })
})
