import { createClient } from '@/lib/supabase/server'
import { getCurrentOrganizationId } from './organizations'
import { assertActiveUnit } from '@/domain/operational-status'
import { chargeSchema, type ChargeInput } from '@/validations/charge'
import type { Tables } from '@/types/supabase'

export type Charge = Tables<'charges'>
export type ChargeFilters = { studentId?: number; unitId?: number; status?: string; from?: string; to?: string }

export class FinancialChargeError extends Error {}

export function assertChargeUnitCanReceiveNewCharge(status: string) { assertActiveUnit(status) }

function competenceDate(value: string | undefined) {
  return value ? `${value}-01` : null
}

export function financialChargeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error && typeof error.message === 'string' ? error.message : ''
  if (message.includes('charges_recurring_competence_unique') || message.includes('financial_recurring_charge_exists')) return 'Já existe uma mensalidade ativa para esta competência.'
  if (message.includes('financial_charge_idempotency_conflict')) return 'Esta tentativa de cobrança já foi usada com dados diferentes.'
  if (message.includes('financial_inactive_student_plan')) return 'Não é possível criar uma mensalidade para um vínculo financeiro encerrado ou inativo.'
  if (message.includes('financial_invalid_charge_context')) return 'O aluno, a unidade e o vínculo de plano não são compatíveis.'
  if (message.includes('financial_invalid_charge_competence')) return 'Revise o tipo e a competência da cobrança.'
  if (message.includes('financial_invalid_charge_data')) return 'Revise as datas e o valor da cobrança.'
  if (message.includes('financial_charge_has_payments')) return 'Não é possível cancelar uma cobrança que possui pagamentos registrados.'
  if (message.includes('financial_charge_not_found')) return 'Cobrança não encontrada para sua organização.'
  return 'Não foi possível concluir a operação financeira. Tente novamente.'
}

export async function listCharges(filters: ChargeFilters = {}) {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  let query = supabase.from('charges').select('*').eq('organization_id', organizationId).order('due_date')
  if (filters.studentId) query = query.eq('student_id', filters.studentId)
  if (filters.unitId) query = query.eq('unit_id', filters.unitId)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.from) query = query.gte('due_date', filters.from)
  if (filters.to) query = query.lte('due_date', filters.to)
  const { data, error } = await query
  if (error) throw new Error('Não foi possível carregar cobranças.')
  return data
}

export async function getCharge(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('charges').select('*').eq('id', id).single()
  if (error) throw new Error('Cobrança não encontrada.')
  return data
}

export async function createCharge(input: ChargeInput) {
  const payload = chargeSchema.parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_financial_charge', {
    p_student_id: payload.student_id,
    p_unit_id: payload.unit_id,
    p_student_plan_id: payload.student_plan_id,
    p_charge_type: payload.charge_type,
    p_competence_month: competenceDate(payload.competence_month),
    p_description: payload.description ?? null,
    p_issue_date: payload.issue_date,
    p_due_date: payload.due_date,
    p_value: payload.value,
    p_observation: payload.observation ?? null,
    p_idempotency_key: payload.idempotency_key,
  })
  if (error) throw new FinancialChargeError(financialChargeMessage(error))
  return data
}

export async function cancelCharge(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('cancel_financial_charge', { p_charge_id: id })
  if (error) throw new FinancialChargeError(financialChargeMessage(error))
  return data
}
