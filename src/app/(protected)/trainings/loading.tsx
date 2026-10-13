import { PageHeader } from '@/components/page-header'
import styles from './trainings.module.css'

export default function TrainingsLoading() {
  return <div className={styles.page}><PageHeader title="Treinos" description="Acompanhe as prescrições e acesse os detalhes de cada treino." eyebrow="SLT Free · Organização" badge="SLT Free" /><section className="panel loading-state" aria-busy="true"><h2>Carregando treinos...</h2><p>Estamos preparando as prescrições da sua organização.</p></section></div>
}
