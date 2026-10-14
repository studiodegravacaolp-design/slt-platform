import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ createCharge: vi.fn(), createPayment: vi.fn(), cancelCharge: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/services/charges', () => ({ createCharge: mocks.createCharge, cancelCharge: mocks.cancelCharge, financialChargeMessage: (error: unknown) => error instanceof Error ? error.message : 'Erro financeiro.' }))
vi.mock('@/services/payments', () => ({ createPayment: mocks.createPayment }))
vi.mock('@/services/plans', () => ({ createPlan: vi.fn(), updatePlan: vi.fn(), updatePlanStatus: vi.fn() }))
vi.mock('@/services/student-plans', () => ({ createStudentPlan: vi.fn(), endStudentPlan: vi.fn() }))

import { cancelChargeAction, createChargeAction, createPaymentAction } from './actions'

describe('financial server actions', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns a serializable success result after creating a charge', async () => {
    const form = new FormData()
    form.set('student_id', '15'); form.set('unit_id', '13'); form.set('student_plan_id', '12'); form.set('charge_type', 'recurring'); form.set('competence_month', '2026-10'); form.set('issue_date', '2026-10-01'); form.set('due_date', '2026-10-10'); form.set('value', '100'); form.set('idempotency_key', '47ddea73-b525-49e2-8ee8-495a2726ab9d')
    await expect(createChargeAction(form)).resolves.toEqual({ status: 'success', message: 'Cobrança criada com sucesso.' })
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/financial/charges')
  })

  it('returns a friendly payment error without leaking an implementation detail', async () => {
    mocks.createPayment.mockRejectedValue(new Error('O valor informado é maior que o saldo restante da cobrança.'))
    const form = new FormData()
    form.set('charge_id', '9'); form.set('amount_paid', '101'); form.set('payment_date', '2026-10-07'); form.set('payment_method', 'pix'); form.set('idempotency_key', '47ddea73-b525-49e2-8ee8-495a2726ab9d')
    await expect(createPaymentAction(form)).resolves.toEqual({ status: 'error', message: 'O valor informado é maior que o saldo restante da cobrança.' })
  })

  it('returns a cancellation failure as an action result', async () => {
    mocks.cancelCharge.mockRejectedValue(new Error('Não é possível cancelar uma cobrança que possui pagamentos registrados.'))
    await expect(cancelChargeAction(9)).resolves.toEqual({ status: 'error', message: 'Não é possível cancelar uma cobrança que possui pagamentos registrados.' })
  })
})
