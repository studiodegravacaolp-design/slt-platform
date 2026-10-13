import { randomUUID } from 'node:crypto'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmitButton } from '@/components/confirm-submit-button'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { PageHeader } from '@/components/page-header'
import { calculateChargeFinancialSummary, chargeStatusLabel, chargeTypeLabel, formatBRL } from '@/domain/financial'
import { getCharge } from '@/services/charges'
import { listPayments } from '@/services/payments'
import { listStudents } from '@/services/students'
import { listUnits } from '@/services/units'
import { cancelChargeAction, createPaymentAction } from '../../actions'
import styles from '../../financial.module.css'

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))

export default async function ChargePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let charge
  try { charge = await getCharge(id) } catch { notFound() }
  const [payments, students, units] = await Promise.all([listPayments(id), listStudents(), listUnits()])
  const student = students.find((item) => item.id === charge.student_id)
  const unit = units.find((item) => item.id === charge.unit_id)
  const summary = calculateChargeFinancialSummary(charge, payments)

  return <div className={styles.page}>
    <PageHeader title="Cobrança" description="Dados da cobrança e pagamentos já registrados." eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href="/financial/charges">← Cobranças</Link>} />
    <div className={styles.detailGrid}>
      <section className={`panel ${styles.detailCard}`}><h2>Dados da cobrança</h2><dl className={styles.dataGrid}>
        <div><dt>Aluno</dt><dd>{student?.full_name || 'Aluno indisponível'}</dd></div><div><dt>Unidade</dt><dd>{unit?.name || 'Unidade indisponível'}</dd></div><div><dt>Valor</dt><dd className={styles.money}>{formatBRL(charge.value)}</dd></div><div><dt>Situação</dt><dd><span className={styles.status}>{chargeStatusLabel(summary.status)}</span></dd></div><div><dt>Tipo</dt><dd>{chargeTypeLabel(charge.charge_type)}</dd></div>{charge.competence_month ? <div><dt>Competência</dt><dd>{formatDate(charge.competence_month)}</dd></div> : null}<div><dt>Emissão</dt><dd>{formatDate(charge.issue_date)}</dd></div><div><dt>Vencimento</dt><dd>{formatDate(charge.due_date)}</dd></div>
      </dl></section>
      <section className={`panel ${styles.detailCard}`}><h2>Resumo financeiro</h2><dl className={styles.dataGrid}><div><dt>Total pago</dt><dd className={styles.money}>{formatBRL(summary.totalPaid)}</dd></div><div><dt>Saldo restante</dt><dd className={styles.money}>{formatBRL(summary.remaining)}</dd></div><div className={styles.wide}><dt>Descrição</dt><dd>{charge.description || 'Não informada'}</dd></div><div className={styles.wide}><dt>Observação</dt><dd>{charge.observation || 'Não informada'}</dd></div></dl></section>
    </div>

    <section className={`panel ${styles.paymentsPanel}`}><h2>Pagamentos registrados</h2>
      {payments.length ? <ul className={styles.paymentsTable}>{payments.map((payment) => <li key={payment.id}><div><strong className={styles.money}>{formatBRL(payment.amount_paid)}</strong><span>Valor pago</span></div><div><strong>{formatDate(payment.payment_date)}</strong><span>Data</span></div><div><strong>{payment.payment_method}</strong><span>Método</span></div><div><strong>{payment.observation || 'Sem observação'}</strong><span>Observação</span></div></li>)}</ul> : <p className={styles.paymentsEmpty}>Nenhum pagamento registrado.</p>}
    </section>

    {summary.canAcceptPayment ? <details className={styles.disclosure}><summary>Registrar pagamento</summary><OperationalForm action={createPaymentAction} className={styles.form} successMessage="Pagamento registrado com sucesso."><div className={styles.formGrid}><input type="hidden" name="charge_id" value={id} /><input type="hidden" name="idempotency_key" value={randomUUID()} /><label>Valor pago *<input name="amount_paid" type="number" step="0.01" min="0.01" max={summary.remaining.toFixed(2)} required /></label><label>Data *<input name="payment_date" type="date" required /></label><label>Método *<select name="payment_method" required defaultValue="pix"><option value="cash">Dinheiro</option><option value="pix">Pix</option><option value="card">Cartão</option><option value="transfer">Transferência</option></select></label><label className={styles.wide}>Observação<textarea name="observation" /></label></div><div className={styles.formActions}><OperationalSubmitButton idleLabel="Registrar pagamento" pendingLabel="Registrando..." /></div></OperationalForm></details> : <section className={`panel ${styles.detailCard}`}><p>{summary.status === 'paid' ? 'Esta cobrança já está quitada e não aceita novos pagamentos.' : 'Esta cobrança foi cancelada e não aceita pagamentos.'}</p></section>}
    {summary.status !== 'paid' && summary.status !== 'cancelled' ? <OperationalForm action={cancelChargeAction.bind(null, id)} className={styles.form} successMessage="Cobrança cancelada com sucesso."><ConfirmSubmitButton message="Cancelar esta cobrança? Cobranças com pagamentos não podem ser canceladas.">Cancelar cobrança</ConfirmSubmitButton></OperationalForm> : null}
  </div>
}
