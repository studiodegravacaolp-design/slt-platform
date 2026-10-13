import { PageHeader } from '@/components/page-header'
import styles from '../settings.module.css'

export default function OrganizationLoading() {
  return <div className={styles.page}><PageHeader title="Organização" description="Dados cadastrais da organização atual." eyebrow="SLT Free · Organização" badge="SLT Free" /><section className={`panel ${styles.state} loading-state`} role="status"><h2>Carregando organização...</h2><p>Estamos preparando os dados da sua organização.</p></section></div>
}
