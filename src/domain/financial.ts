export const chargeTypes = ['recurring', 'one_off', 'legacy'] as const
export const creatableChargeTypes = ['recurring', 'one_off'] as const
export const chargeStatuses = ['pending', 'overdue', 'paid', 'cancelled'] as const

export type ChargeType = (typeof chargeTypes)[number]
export type ChargeStatus = (typeof chargeStatuses)[number]

type PaymentAmount = { amount_paid: number }
type ChargeFinancialData = { value: number; due_date: string; status: string }

const cents = (value: number) => Math.round(value * 100)

export function calculateChargeFinancialSummary(charge: ChargeFinancialData, payments: PaymentAmount[], today = new Date().toISOString().slice(0, 10)) {
  const totalPaidCents = payments.reduce((total, payment) => total + cents(payment.amount_paid), 0)
  const valueCents = cents(charge.value)
  const remainingCents = Math.max(0, valueCents - totalPaidCents)
  const status: ChargeStatus = charge.status === 'cancelled'
    ? 'cancelled'
    : remainingCents === 0 ? 'paid'
      : charge.due_date < today || charge.status === 'overdue' ? 'overdue'
        : 'pending'
  return { totalPaid: totalPaidCents / 100, remaining: remainingCents / 100, status, canAcceptPayment: status === 'pending' || status === 'overdue' }
}

export function chargeStatusLabel(status: string) {
  return ({ pending: 'Pendente', overdue: 'Vencida', paid: 'Quitada', cancelled: 'Cancelada' } as Record<string, string>)[status] ?? 'Situação indisponível'
}

export function chargeTypeLabel(type: string) {
  return ({ recurring: 'Mensalidade recorrente', one_off: 'Cobrança avulsa', legacy: 'Registro histórico' } as Record<string, string>)[type] ?? 'Tipo indisponível'
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
