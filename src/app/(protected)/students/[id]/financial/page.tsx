import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmitButton } from '@/components/confirm-submit-button'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { PageHeader } from '@/components/page-header'
import { getStudent } from '@/services/students'
import { listActiveUnits, listUnits } from '@/services/units'
import { listPlans } from '@/services/plans'
import { listStudentPlans } from '@/services/student-plans'
import { createStudentPlanAction, endStudentPlanAction } from '../../../financial/actions'
import styles from '../../../financial/financial.module.css'

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : 'Não informado'

export default async function StudentFinancial({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let student
  try { student = await getStudent(id) } catch { notFound() }
  const [activeUnits, units, plans, links] = await Promise.all([listActiveUnits(), listUnits(), listPlans(), listStudentPlans(id)])
  const unitNames = new Map(units.map((unit) => [unit.id, unit.name]))
  const planNames = new Map(plans.map((plan) => [plan.id, plan.name]))

  return <div className={styles.page}>
    <PageHeader title="Financeiro do aluno" description={`Planos e vínculos financeiros de ${student.social_name || student.full_name}.`} eyebrow="SLT Free · Gestão de alunos" badge="SLT Free" action={<Link className="button" href={`/students/${id}`}>← Perfil do aluno</Link>} />
    <section className={`panel ${styles.tablePanel}`}>
      {links.length ? <table className={styles.table}><caption>Vínculos financeiros do aluno</caption><thead><tr><th>Plano</th><th>Unidade</th><th>Início</th><th>Término</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{links.map((link) => <tr key={link.id}>
        <td><strong className={styles.primaryValue}>{planNames.get(link.plan_id) || 'Plano indisponível'}</strong></td><td>{unitNames.get(link.unit_id) || 'Unidade indisponível'}</td><td>{formatDate(link.start_date)}</td><td>{formatDate(link.end_date)}</td><td><span className={styles.status}>{link.status}</span></td><td><details className={styles.inlineDisclosure}><summary>Encerrar vínculo</summary><OperationalForm action={endStudentPlanAction.bind(null, link.id)} className={styles.inlineForm} successMessage="Vínculo encerrado com sucesso."><label>Data de término<input name="end_date" type="date" required /></label><label>Status<input name="status" required placeholder="Informe o status" /></label><ConfirmSubmitButton message="Encerrar este vínculo financeiro?">Confirmar encerramento</ConfirmSubmitButton></OperationalForm></details></td>
      </tr>)}</tbody></table> : <div className="empty-state"><h2>Nenhum plano vinculado</h2><p>Vincule um plano financeiro para registrar o histórico do aluno.</p></div>}
    </section>

    <details className={styles.disclosure}><summary>Vincular plano</summary><OperationalForm action={createStudentPlanAction} className={styles.form} successMessage="Plano vinculado com sucesso."><div className={styles.formGrid}><input type="hidden" name="student_id" value={id} /><label>Unidade *<select name="unit_id" required defaultValue=""><option value="" disabled>Selecione</option>{activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label>Plano *<select name="plan_id" required defaultValue=""><option value="" disabled>Selecione</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label><label>Início *<input name="start_date" type="date" required /></label><label>Término<input name="end_date" type="date" /></label><label>Status<input name="status" /></label><label className={styles.wide}>Observação<textarea name="observation" /></label></div><div className={styles.formActions}><OperationalSubmitButton idleLabel="Vincular plano" pendingLabel="Vinculando..." /></div></OperationalForm></details>
  </div>
}
