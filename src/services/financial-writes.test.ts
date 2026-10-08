import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), createClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))

import { createCharge } from './charges'
import { createPayment } from './payments'

describe('financial writes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ rpc: mocks.rpc })
    mocks.rpc.mockResolvedValue({ data: { id: 1 }, error: null })
  })

  it('uses the protected charge RPC with the canonical first day of the competence', async () => {
    const idempotencyKey = '47ddea73-b525-49e2-8ee8-495a2726ab9d'
    await createCharge({ student_id: 15, unit_id: 13, student_plan_id: 12, charge_type: 'recurring', competence_month: '2026-10', issue_date: '2026-10-01', due_date: '2026-10-10', value: 100, idempotency_key: idempotencyKey })
    expect(mocks.rpc).toHaveBeenCalledWith('create_financial_charge', expect.objectContaining({ p_charge_type: 'recurring', p_competence_month: '2026-10-01', p_value: 100, p_idempotency_key: idempotencyKey }))
  })

  it('uses the protected payment RPC with the idempotency key', async () => {
    const idempotencyKey = '47ddea73-b525-49e2-8ee8-495a2726ab9d'
    await createPayment({ charge_id: 9, amount_paid: 100, payment_date: '2026-10-07', payment_method: 'pix', idempotency_key: idempotencyKey })
    expect(mocks.rpc).toHaveBeenCalledWith('record_financial_payment', expect.objectContaining({ p_charge_id: 9, p_idempotency_key: idempotencyKey }))
  })

  it('returns a safe message for an excessive payment', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'financial_payment_exceeds_balance' } })
    await expect(createPayment({ charge_id: 9, amount_paid: 101, payment_date: '2026-10-07', payment_method: 'pix', idempotency_key: '47ddea73-b525-49e2-8ee8-495a2726ab9d' })).rejects.toThrow('maior que o saldo restante')
  })

  it('returns a safe message when a charge idempotency key is replayed with another payload', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'financial_charge_idempotency_conflict' } })
    await expect(createCharge({ student_id: 15, unit_id: 13, student_plan_id: 12, charge_type: 'one_off', issue_date: '2026-10-01', due_date: '2026-10-10', value: 100, idempotency_key: '47ddea73-b525-49e2-8ee8-495a2726ab9d' })).rejects.toThrow('dados diferentes')
  })
})
