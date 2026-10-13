import { createClient } from '@/lib/supabase/server'
import { paymentSchema, type PaymentInput } from '@/validations/payment'
import type { Tables } from '@/types/supabase'

export type Payment = Tables<'payments'>

export class FinancialPaymentError extends Error {}

function financialPaymentMessage(error: unknown) {
  const message = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error && typeof error.message === 'string' ? error.message : ''
  if (message.includes('financial_payment_exceeds_balance')) return 'O valor informado é maior que o saldo restante da cobrança.'
  if (message.includes('financial_charge_cancelled')) return 'Cobranças canceladas não aceitam pagamentos.'
  if (message.includes('financial_charge_paid')) return 'Esta cobrança já está quitada e não aceita novos pagamentos.'
  if (message.includes('financial_payment_idempotency_conflict')) return 'Esta tentativa de pagamento já foi usada com dados diferentes.'
  if (message.includes('financial_charge_not_found')) return 'Cobrança não encontrada para sua organização.'
  return 'Não foi possível registrar o pagamento. Tente novamente.'
}

export async function listPayments(chargeId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('payments').select('*').eq('charge_id', chargeId).order('payment_date', { ascending: false })
  if (error) throw new Error('Não foi possível carregar pagamentos.')
  return data
}

export async function getPayment(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('payments').select('*').eq('id', id).single()
  if (error) throw new Error('Pagamento não encontrado.')
  return data
}

export async function createPayment(input: PaymentInput) {
  const payload = paymentSchema.parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('record_financial_payment', {
    p_charge_id: payload.charge_id,
    p_amount_paid: payload.amount_paid,
    p_payment_date: payload.payment_date,
    p_payment_method: payload.payment_method,
    p_observation: payload.observation ?? null,
    p_idempotency_key: payload.idempotency_key,
  })
  if (error) throw new FinancialPaymentError(financialPaymentMessage(error))
  return data
}
