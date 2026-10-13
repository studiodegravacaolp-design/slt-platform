import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { createChargeAction } from '../actions'
import { listCharges } from '@/services/charges'
import { listPlans } from '@/services/plans'
import { listStudents } from '@/services/students'
import { listAllStudentPlans } from '@/services/student-plans'
import { listActiveUnits, listUnits } from '@/services/units'
import styles from '../financial.module.css'

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))

export default async function ChargesPage({ searchParams }: { searchParams: Promise<{ student_id?: string; unit_id?: string; status?: string; from?: string; to?: string }> }) {
  const query = await searchParams
  const [charges, students, units, activeUnits, plans, studentPlans] = await Promise.all([
    listCharges({ studentId: Number(query.student_id) || undefined, unitId: Number(query.unit_id) || undefined, status: query.status, from: query.from, to: query.to }),
    listStudents(), listUnits(), listActiveUnits(), listPlans(), listAllStudentPlans(),
  ])
  const studentsById = new Map(students.map((student) => [student.id, student]))
  const unitsById = new Map(units.map((unit) => [unit.id, unit]))
  const plansById = new Map(plans.map((plan) => [plan.id, plan]))

  return <div className={styles.page}>
    <PageHeader title="Cobranças" description="Consulte e registre cobranças da organização." eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href="/financial">← Financeiro</Link>} />

    <form className={`panel ${styles.filters}`}>
      <div className={styles.filterGrid}>
        <label>Aluno<select name="student_id" defaultValue={query.student_id || ''}><option value="">Todos os alunos</option>{students.map((student) => <option value={student.id} key={student.id}>{student.full_name}</option>)}</select></label>
        <label>Unidade<select name="unit_id" defaultValue={query.unit_id || ''}><option value="">Todas as unidades</option>{units.map((unit) => <option value={unit.id} key={unit.id}>{unit.name}</option>)}</select></label>
        <label>Situação<input name="status" defaultValue={query.status} placeholder="Informe o status" /></label>
        <label>Vencimento a partir de<input name="from" type="date" defaultValue={query.from} /></label>
        <label>Vencimento até<input name="to" type="date" defaultValue={query.to} /></label>
      </div>
      <div className={styles.filterActions}><button type="submit">Filtrar</button><Link className={`button ${styles.secondaryButton}`} href="/financial/charges">Limpar filtros</Link></div>
    </form>

    <section className={`panel ${styles.tablePanel}`}>
      {charges.length ? <table className={styles.table}><caption>Cobranças encontradas</caption><thead><tr><th>Aluno</th><th>Unidade</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{charges.map((charge) => <tr key={charge.id}>
        <td><strong className={styles.primaryValue}>{studentsById.get(charge.student_id)?.full_name || 'Aluno indisponível'}</strong>{charge.description ? <span className={styles.secondaryValue}>{charge.description}</span> : null}</td>
        <td>{unitsById.get(charge.unit_id)?.name || 'Unidade indisponível'}</td><td>{formatDate(charge.due_date)}</td><td className={styles.money}>{formatCurrency(charge.value)}</td><td><span className={styles.status}>{charge.status}</span></td><td><Link className={styles.action} href={`/financial/charges/${charge.id}`}>Ver detalhes →</Link></td>
      </tr>)}</tbody></table> : <div className="empty-state"><h2>Nenhuma cobrança encontrada</h2><p>Ajuste os filtros ou registre uma cobrança.</p></div>}
    </section>

    <details className={styles.disclosure}><summary>Nova cobrança</summary><OperationalForm action={createChargeAction} className={styles.form} successMessage="Cobrança criada com sucesso."><div className={styles.formGrid}>
      <label>Aluno *<select name="student_id" required defaultValue=""><option value="" disabled>Selecione</option>{students.map((student) => <option value={student.id} key={student.id}>{student.full_name}</option>)}</select></label>
      <label>Unidade *<select name="unit_id" required defaultValue=""><option value="" disabled>Selecione</option>{activeUnits.map((unit) => <option value={unit.id} key={unit.id}>{unit.name}</option>)}</select></label>
      <label>Vínculo de plano *<select name="student_plan_id" required defaultValue=""><option value="" disabled>Selecione</option>{studentPlans.map((studentPlan) => <option value={studentPlan.id} key={studentPlan.id}>{studentsById.get(studentPlan.student_id)?.full_name || 'Aluno indisponível'} · {unitsById.get(studentPlan.unit_id)?.name || 'Unidade indisponível'} · {plansById.get(studentPlan.plan_id)?.name || 'Plano indisponível'}</option>)}</select></label>
      <label>Emissão *<input name="issue_date" type="date" required /></label><label>Vencimento *<input name="due_date" type="date" required /></label><label>Valor *<input name="value" type="number" step="0.01" min="0.01" required /></label><label>Status *<input name="status" required placeholder="Informe o status" /></label><label>Descrição<input name="description" /></label><label className={styles.wide}>Observação<textarea name="observation" /></label>
    </div><p className={styles.note}>O sistema valida no servidor a compatibilidade entre aluno, unidade e vínculo financeiro.</p><div className={styles.formActions}><OperationalSubmitButton idleLabel="Criar cobrança" pendingLabel="Criando..." /></div></OperationalForm></details>
  </div>
}
