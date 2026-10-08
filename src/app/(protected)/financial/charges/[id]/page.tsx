import { randomUUID } from 'node:crypto'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmitButton } from '@/components/confirm-submit-button'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { calculateChargeFinancialSummary, chargeStatusLabel, chargeTypeLabel, formatBRL } from '@/domain/financial'
import { getCharge } from '@/services/charges'
import { listPayments } from '@/services/payments'
import { listStudents } from '@/services/students'
import { listUnits } from '@/services/units'
import { cancelChargeAction, createPaymentAction } from '../../actions'

export default async function ChargePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let charge
  try { charge = await getCharge(id) } catch { notFound() }
  const [payments, students, units] = await Promise.all([listPayments(id), listStudents(), listUnits()])
  const summary = calculateChargeFinancialSummary(charge, payments)
  const idempotencyKey = randomUUID()

  return <>
    <Link href="/financial/charges">← Cobranças</Link><h1>Cobrança</h1>
    <section className="panel">
      <p>{students.find((student) => student.id === charge.student_id)?.full_name || 'Aluno indisponível'} · {units.find((unit) => unit.id === charge.unit_id)?.name || 'Unidade indisponível'}</p>
      <p>{formatBRL(charge.value)} · emissão {charge.issue_date} · vencimento {charge.due_date}</p>
      <p>Situação: <strong>{chargeStatusLabel(summary.status)}</strong> · Tipo: {chargeTypeLabel(charge.charge_type)}</p>
      {charge.competence_month && <p>Competência: {charge.competence_month.slice(5, 7)}/{charge.competence_month.slice(0, 4)}</p>}
      <p>{charge.description || 'Sem descrição'}{charge.observation && ` · ${charge.observation}`}</p>
    </section>
    <section className="panel"><h2>Resumo financeiro</h2><p>Total pago: <strong>{formatBRL(summary.totalPaid)}</strong></p><p>Saldo restante: <strong>{formatBRL(summary.remaining)}</strong></p></section>
    <section className="panel"><h2>Pagamentos</h2>{payments.length ? <ul>{payments.map((payment) => <li key={payment.id}>{formatBRL(payment.amount_paid)} · {payment.payment_date} · {payment.payment_method}{payment.observation && ` · ${payment.observation}`}</li>)}</ul> : <p>Nenhum pagamento registrado.</p>}</section>
    {summary.canAcceptPayment ? <OperationalForm action={createPaymentAction} className="student-form" successMessage="Pagamento registrado com sucesso.">
      <section className="form-section"><h2>Registrar pagamento</h2><div className="form-grid"><input type="hidden" name="charge_id" value={id} /><input type="hidden" name="idempotency_key" value={idempotencyKey} /><label>Valor pago *<input name="amount_paid" type="number" step="0.01" min="0.01" max={summary.remaining.toFixed(2)} required /></label><label>Data *<input name="payment_date" type="date" required /></label><label>Método *<select name="payment_method" required defaultValue="pix"><option value="cash">Dinheiro</option><option value="pix">Pix</option><option value="card">Cartão</option><option value="transfer">Transferência</option></select></label><label className="span-2">Observação<textarea name="observation" /></label></div></section>
      <div className="form-actions"><OperationalSubmitButton idleLabel="Registrar pagamento" pendingLabel="Registrando..." /></div>
    </OperationalForm> : <section className="panel"><p>{summary.status === 'paid' ? 'Esta cobrança já está quitada e não aceita novos pagamentos.' : 'Esta cobrança foi cancelada e não aceita pagamentos.'}</p></section>}
    {summary.status !== 'paid' && summary.status !== 'cancelled' && <OperationalForm action={cancelChargeAction.bind(null, id)} successMessage="Cobrança cancelada com sucesso."><ConfirmSubmitButton message="Cancelar esta cobrança? Cobranças com pagamentos não podem ser canceladas.">Cancelar cobrança</ConfirmSubmitButton></OperationalForm>}
  </>
}
