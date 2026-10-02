import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { createChargeAction } from '../actions'
import { listCharges } from '@/services/charges'
import { listPlans } from '@/services/plans'
import { listStudents } from '@/services/students'
import { listAllStudentPlans } from '@/services/student-plans'
import { listUnits } from '@/services/units'

export default async function ChargesPage({ searchParams }: { searchParams: Promise<{ student_id?: string; unit_id?: string; status?: string; from?: string; to?: string }> }) {
  const query = await searchParams
  const [charges, students, units, plans, studentPlans] = await Promise.all([
    listCharges({ studentId: Number(query.student_id) || undefined, unitId: Number(query.unit_id) || undefined, status: query.status, from: query.from, to: query.to }),
    listStudents(), listUnits(), listPlans(), listAllStudentPlans(),
  ])
  const studentsById = new Map(students.map((student) => [student.id, student]))
  const unitsById = new Map(units.map((unit) => [unit.id, unit]))
  const plansById = new Map(plans.map((plan) => [plan.id, plan]))

  return <>
    <PageHeader title="Cobranças" description="Consulte e registre cobranças da organização." action={<Link className="button" href="/financial">← Financeiro</Link>} />
    <section className="panel">
      <form className="search-form"><select name="student_id" defaultValue={query.student_id || ''}><option value="">Todos os alunos</option>{students.map((student) => <option value={student.id} key={student.id}>{student.full_name}</option>)}</select><select name="unit_id" defaultValue={query.unit_id || ''}><option value="">Todas unidades</option>{units.map((unit) => <option value={unit.id} key={unit.id}>{unit.name}</option>)}</select><input name="status" defaultValue={query.status} placeholder="Status" /><input name="from" type="date" defaultValue={query.from} /><input name="to" type="date" defaultValue={query.to} /><button>Filtrar</button></form>
      {charges.length ? <div className="student-list">{charges.map((charge) => <Link className="student-row" href={`/financial/charges/${charge.id}`} key={charge.id}><div><strong>{studentsById.get(charge.student_id)?.full_name || `Aluno #${charge.student_id}`}</strong><span>R$ {charge.value.toFixed(2)} · vence {charge.due_date} · {charge.status}</span></div></Link>)}</div> : <div className="empty-state"><h2>Nenhuma cobrança encontrada</h2><p>Ajuste os filtros ou registre uma cobrança.</p></div>}
    </section>
    <form action={createChargeAction} className="student-form"><section className="form-section"><h2>Nova cobrança</h2><div className="form-grid"><label>Aluno *<select name="student_id" required defaultValue=""><option value="" disabled>Selecione</option>{students.map((student) => <option value={student.id} key={student.id}>{student.full_name}</option>)}</select></label><label>Unidade *<select name="unit_id" required defaultValue=""><option value="" disabled>Selecione</option>{units.map((unit) => <option value={unit.id} key={unit.id}>{unit.name}</option>)}</select></label><label>Vínculo de plano *<select name="student_plan_id" required defaultValue=""><option value="" disabled>Selecione</option>{studentPlans.map((studentPlan) => <option value={studentPlan.id} key={studentPlan.id}>{studentsById.get(studentPlan.student_id)?.full_name || 'Aluno indisponível'} · {unitsById.get(studentPlan.unit_id)?.name || 'Unidade indisponível'} · {plansById.get(studentPlan.plan_id)?.name || 'Plano indisponível'}</option>)}</select></label><label>Emissão *<input name="issue_date" type="date" required /></label><label>Vencimento *<input name="due_date" type="date" required /></label><label>Valor *<input name="value" type="number" step="0.01" min="0.01" required /></label><label>Status *<input name="status" required /></label><label>Descrição<input name="description" /></label><label className="span-2">Observação<textarea name="observation" /></label></div></section><div className="form-actions"><button>Criar cobrança</button></div></form>
  </>
}
