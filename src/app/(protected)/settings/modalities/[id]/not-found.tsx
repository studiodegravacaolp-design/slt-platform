import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import styles from '../modalities.module.css'

export default function ModalityNotFound() {
  return <div className={styles.page}><PageHeader title="Modalidade" description="Consulte as modalidades esportivas vinculadas às unidades." eyebrow="SLT Free · Organização" /><section className="panel empty-state"><h2>Modalidade não encontrada</h2><p>Ela pode não existir ou não estar disponível para sua organização.</p><Link className="button" href="/settings/modalities">Voltar para modalidades</Link></section></div>
}
