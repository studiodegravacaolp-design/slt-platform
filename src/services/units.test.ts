import { describe, expect, it } from 'vitest'
import { assertUnitCanBecomeMain, assertUnitStatusChange } from './units'

describe('unit lifecycle guards', () => {
  it('does not allow the main unit to become inactive', () => {
    expect(() => assertUnitStatusChange({ is_main: true }, 'inactive')).toThrow('A unidade principal não pode ser inativada.')
  })

  it('allows a main unit to remain active', () => {
    expect(() => assertUnitStatusChange({ is_main: true }, 'active')).not.toThrow()
  })

  it('does not allow an inactive unit to become main', () => {
    expect(() => assertUnitCanBecomeMain({ status: 'inactive' })).toThrow('A unidade selecionada está inativa.')
  })
})
