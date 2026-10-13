import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { listPlans } from '@/services/plans'
import { savePlanAction } from '../actions'
import styles from '../financial.module.css'

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default async function PlansPage() {
  const plans = await listPlans()
  return <div className={styles.page}>
    <PageHeader title="Planos" description="Gerencie os planos financeiros oferecidos pela organização." eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href="/financial">← Financeiro</Link>} />
    <section className={`panel ${styles.tablePanel}`}>
      {plans.length ? <table className={styles.table}><caption>Planos financeiros cadastrados</caption><thead><tr><th>Plano</th><th>Periodicidade</th><th>Valor</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{plans.map((plan) => <tr key={plan.id}>
        <td><strong className={styles.primaryValue}>{plan.name}</strong>{plan.description ? <span className={styles.secondaryValue}>{plan.description}</span> : null}</td><td>{plan.periodicity}</td><td className={styles.money}>{formatCurrency(plan.value)}</td><td><span className={styles.status}>{plan.status}</span></td><td><details className={styles.inlineDisclosure}><summary>Editar</summary><OperationalForm action={savePlanAction.bind(null, plan.id)} className={styles.form} successMessage="Plano atualizado com sucesso."><div className={styles.formGrid}><label>Nome *<input name="name" required defaultValue={plan.name} /></label><label>Periodicidade *<input name="periodicity" required defaultValue={plan.periodicity} /></label><label>Valor *<input name="value" type="number" step="0.01" min="0.01" required defaultValue={plan.value} /></label><label>Status<input name="status" defaultValue={plan.status} /></label><label className={styles.wide}>Descrição<textarea name="description" defaultValue={plan.description || ''} /></label></div><div className={styles.formActions}><OperationalSubmitButton idleLabel="Salvar alterações" pendingLabel="Salvando..." /></div></OperationalForm></details></td>
      </tr>)}</tbody></table> : <div className="empty-state"><h2>Nenhum plano cadastrado</h2><p>Crie o primeiro plano para vinculá-lo aos alunos.</p></div>}
    </section>
    <details className={styles.disclosure}><summary>Novo plano</summary><OperationalForm action={savePlanAction.bind(null, undefined)} className={styles.form} successMessage="Plano criado com sucesso."><div className={styles.formGrid}><label>Nome *<input name="name" required /></label><label>Periodicidade *<input name="periodicity" required /></label><label>Valor *<input name="value" type="number" step="0.01" min="0.01" required /></label><label>Status<input name="status" /></label><label className={styles.wide}>Descrição<textarea name="description" /></label></div><div className={styles.formActions}><OperationalSubmitButton idleLabel="Criar plano" pendingLabel="Criando..." /></div></OperationalForm></details>
  </div>
}
