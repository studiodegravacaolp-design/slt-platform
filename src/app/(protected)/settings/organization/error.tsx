'use client'

import { PageHeader } from '@/components/page-header'
import styles from '../settings.module.css'

export default function OrganizationError({ reset }: Readonly<{ reset: () => void }>) {
  return <div className={styles.page}><PageHeader title="Organização" description="Dados cadastrais da organização atual." eyebrow="SLT Free · Organização" badge="SLT Free" /><section className={`panel ${styles.state} error-state`} role="alert"><h2>Não foi possível carregar a organização</h2><p>Verifique sua conexão e tente novamente.</p><button type="button" onClick={reset}>Tentar novamente</button></section></div>
}
