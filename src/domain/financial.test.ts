import { describe, expect, it } from 'vitest'
import { calculateChargeFinancialSummary, chargeStatusLabel } from './financial'

const charge = { value: 100, due_date: '2026-10-31', status: 'pending' }

describe('financial charge summary', () => {
  it('calculates a partial payment and keeps the charge pending', () => {
    expect(calculateChargeFinancialSummary(charge, [{ amount_paid: 40 }], '2026-10-07')).toEqual({ totalPaid: 40, remaining: 60, status: 'pending', canAcceptPayment: true })
  })

  it('marks a fully paid charge as paid even if legacy status was pending', () => {
    expect(calculateChargeFinancialSummary(charge, [{ amount_paid: 100 }], '2026-10-07')).toMatchObject({ totalPaid: 100, remaining: 0, status: 'paid', canAcceptPayment: false })
  })

  it('presents outstanding past-due charges as overdue and cancelled charges as closed', () => {
    expect(calculateChargeFinancialSummary({ ...charge, due_date: '2026-09-30' }, [], '2026-10-07').status).toBe('overdue')
    expect(calculateChargeFinancialSummary({ ...charge, status: 'cancelled' }, [], '2026-10-07').canAcceptPayment).toBe(false)
    expect(chargeStatusLabel('paid')).toBe('Quitada')
  })
})
