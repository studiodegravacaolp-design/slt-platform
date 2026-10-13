import { PageHeader } from '@/components/page-header'
import styles from './modalities.module.css'

export default function ModalitiesLoading() {
  return <div className={styles.page}><PageHeader title="Modalidades" description="Gerencie as modalidades esportivas vinculadas às unidades." eyebrow="SLT Free · Organização" badge="SLT Free" /><section className="panel loading-state"><h2>Carregando modalidades...</h2><p>Estamos preparando os dados da sua organização.</p></section></div>
}
