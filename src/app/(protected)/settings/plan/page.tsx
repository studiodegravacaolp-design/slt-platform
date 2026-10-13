import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import styles from '../settings.module.css'

export const currentSltPlan = 'Free'

export default function PlanPage() {
  return <div className={styles.page}>
    <PageHeader title="Plano comercial" description="Informações do plano SLT disponível para sua organização." eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href="/settings">← Configurações</Link>} />
    <section className={`${styles.card} ${styles.planCard}`}><span className={styles.planBadge}>Plano atual</span><h2 className={styles.planName}>SLT {currentSltPlan}</h2><p className={styles.note}>Você está utilizando o Plano Free do SLT.</p><p className={styles.note}>Gestão de assinaturas, upgrades e cobranças comerciais do SLT não está disponível nesta versão.</p><p className={styles.note}>Os planos cobrados dos alunos ficam no módulo Financeiro.</p></section>
  </div>
}
