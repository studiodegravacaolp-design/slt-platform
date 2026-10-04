import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { getCharge } from '@/services/charges'
import { listPayments } from '@/services/payments'
import { listStudents } from '@/services/students'
import { listUnits } from '@/services/units'
import { createPaymentAction } from '../../actions'

export default async function ChargePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let charge
  try { charge = await getCharge(id) } catch { notFound() }
  const [payments, students, units] = await Promise.all([listPayments(id), listStudents(), listUnits()])
  return <><Link href="/financial/charges">← Cobranças</Link><h1>Cobrança</h1><section className="panel"><p>{students.find((student) => student.id === charge.student_id)?.full_name || 'Aluno indisponível'} · {units.find((unit) => unit.id === charge.unit_id)?.name || 'Unidade indisponível'}</p><p>R$ {charge.value.toFixed(2)} · emissão {charge.issue_date} · vencimento {charge.due_date} · {charge.status}</p><p>{charge.description || 'Sem descrição'}{charge.observation && ` · ${charge.observation}`}</p></section><section className="panel"><h2>Pagamentos</h2>{payments.length ? <ul>{payments.map((payment) => <li key={payment.id}>R$ {payment.amount_paid.toFixed(2)} · {payment.payment_date} · {payment.payment_method}{payment.observation && ` · ${payment.observation}`}</li>)}</ul> : <p>Nenhum pagamento registrado.</p>}</section><OperationalForm action={createPaymentAction} className="student-form" successMessage="Pagamento registrado com sucesso."><section className="form-section"><h2>Registrar pagamento</h2><div className="form-grid"><input type="hidden" name="charge_id" value={id} /><label>Valor pago *<input name="amount_paid" type="number" step="0.01" min="0.01" required /></label><label>Data *<input name="payment_date" type="date" required /></label><label>Método *<input name="payment_method" required /></label><label className="span-2">Observação<textarea name="observation" /></label></div></section><div className="form-actions"><OperationalSubmitButton idleLabel="Registrar pagamento" pendingLabel="Registrando..." /></div></OperationalForm></>
}
