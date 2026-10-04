import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmitButton } from '@/components/confirm-submit-button'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { getStudent } from '@/services/students'
import { listActiveUnits, listUnits } from '@/services/units'
import { listPlans } from '@/services/plans'
import { listStudentPlans } from '@/services/student-plans'
import { createStudentPlanAction, endStudentPlanAction } from '../../../financial/actions'

export default async function StudentFinancial({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let student
  try { student = await getStudent(id) } catch { notFound() }
  const [activeUnits, units, plans, links] = await Promise.all([listActiveUnits(), listUnits(), listPlans(), listStudentPlans(id)])
  const unitNames = new Map(units.map((unit) => [unit.id, unit.name]))
  const planNames = new Map(plans.map((plan) => [plan.id, plan.name]))
  return <><Link href={`/students/${id}`}>← {student.full_name}</Link><h1>Financeiro do aluno</h1><section className="panel"><h2>Planos vinculados</h2>{links.length ? <ul>{links.map((link) => <li key={link.id}>{planNames.get(link.plan_id) || 'Plano indisponível'} · {unitNames.get(link.unit_id) || 'Unidade indisponível'} · {link.status}<OperationalForm action={endStudentPlanAction.bind(null, link.id)} successMessage="Vínculo encerrado com sucesso."><input name="end_date" type="date" required /><input name="status" required placeholder="Status" /><ConfirmSubmitButton message="Encerrar este vínculo financeiro?">Encerrar vínculo</ConfirmSubmitButton></OperationalForm></li>)}</ul> : <p>Nenhum plano vinculado.</p>}</section><OperationalForm action={createStudentPlanAction} className="student-form" successMessage="Plano vinculado com sucesso."><section className="form-section"><h2>Vincular plano</h2><div className="form-grid"><input type="hidden" name="student_id" value={id} /><label>Unidade *<select name="unit_id" required defaultValue=""><option value="" disabled>Selecione</option>{activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label>Plano *<select name="plan_id" required defaultValue=""><option value="" disabled>Selecione</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label><label>Início *<input name="start_date" type="date" required /></label><label>Término<input name="end_date" type="date" /></label><label>Status<input name="status" /></label><label className="span-2">Observação<textarea name="observation" /></label></div></section><div className="form-actions"><OperationalSubmitButton idleLabel="Vincular plano" pendingLabel="Vinculando..." /></div></OperationalForm></>
}
