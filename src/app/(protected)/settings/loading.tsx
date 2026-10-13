import { PageHeader } from '@/components/page-header'
import styles from './settings.module.css'

export default function SettingsLoading() {
  return <div className={styles.page}><PageHeader title="Configurações" description="Gerencie o ambiente da organização." eyebrow="SLT Free · Organização" badge="SLT Free" /><section className={`panel ${styles.state} loading-state`} role="status"><h2>Carregando configurações...</h2><p>Estamos preparando as informações da organização.</p></section></div>
}
