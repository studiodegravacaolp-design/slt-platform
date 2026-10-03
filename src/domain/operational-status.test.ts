import { describe, expect, it } from 'vitest'
import { assertActiveModality, assertActiveUnit, operationalStatusLabel } from './operational-status'

describe('operational status', () => {
  it('uses Portuguese labels without exposing canonical values', () => {
    expect(operationalStatusLabel('active')).toBe('Ativa')
    expect(operationalStatusLabel('inactive')).toBe('Inativa')
  })

  it('rejects inactive contexts for every new operational flow', () => {
    for (const flow of ['vínculo esportivo', 'treinamento', 'presença', 'avaliação', 'vínculo financeiro']) {
      expect(() => assertActiveUnit('inactive'), flow).toThrow('A unidade selecionada está inativa.')
    }
    expect(() => assertActiveModality('inactive')).toThrow('A modalidade selecionada está inativa.')
  })

  it('keeps active contexts available for new operations', () => {
    expect(() => assertActiveUnit('active')).not.toThrow()
    expect(() => assertActiveModality('active')).not.toThrow()
  })
})
