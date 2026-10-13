'use client'

import { PageHeader } from '@/components/page-header'
import styles from './settings.module.css'

export default function SettingsError({ reset }: Readonly<{ reset: () => void }>) {
  return <div className={styles.page}><PageHeader title="Configurações" description="Gerencie o ambiente da organização." eyebrow="SLT Free · Organização" badge="SLT Free" /><section className={`panel ${styles.state} error-state`} role="alert"><h2>Não foi possível carregar as configurações</h2><p>Verifique sua conexão e tente novamente.</p><button type="button" onClick={reset}>Tentar novamente</button></section></div>
}
