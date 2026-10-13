import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import styles from './financial.module.css'

export default function FinancialPage() {
  return <div className={styles.page}>
    <PageHeader
      title="Financeiro"
      description="Planos, cobranças e pagamentos da sua organização."
      eyebrow="SLT Free · Organização"
      badge="SLT Free"
    />
    <section className={styles.entryCards} aria-label="Áreas financeiras">
      <Link className={styles.entryCard} href="/financial/plans">
        <span className={styles.entryIcon} aria-hidden="true">▣</span>
        <h2>Planos</h2>
        <p>Cadastre, edite e mantenha os planos oferecidos aos alunos.</p>
        <span className={styles.entryLink}>Gerenciar planos →</span>
      </Link>
      <Link className={styles.entryCard} href="/financial/charges">
        <span className={styles.entryIcon} aria-hidden="true">◷</span>
        <h2>Cobranças</h2>
        <p>Consulte cobranças existentes e registre pagamentos recebidos.</p>
        <span className={styles.entryLink}>Consultar cobranças →</span>
      </Link>
    </section>
  </div>
}
