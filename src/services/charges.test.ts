import { describe, expect, it } from 'vitest'
import { assertChargeUnitCanReceiveNewCharge } from './charges'

describe('charge context guard', () => {
  it('rejects a new charge for an inactive unit', () => {
    expect(() => assertChargeUnitCanReceiveNewCharge('inactive')).toThrow('A unidade selecionada está inativa.')
  })

  it('allows a new charge for an active unit', () => {
    expect(() => assertChargeUnitCanReceiveNewCharge('active')).not.toThrow()
  })
})
