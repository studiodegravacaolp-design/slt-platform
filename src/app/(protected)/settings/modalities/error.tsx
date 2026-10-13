'use client'

import { PageHeader } from '@/components/page-header'
import styles from './modalities.module.css'

export default function ModalitiesError({ reset }: Readonly<{ reset: () => void }>) {
  return <div className={styles.page}><PageHeader title="Modalidades" description="Gerencie as modalidades esportivas vinculadas às unidades." eyebrow="SLT Free · Organização" badge="SLT Free" /><section className="panel error-state"><h2>Não foi possível carregar as modalidades</h2><p>Verifique sua conexão e tente novamente.</p><button onClick={reset}>Tentar novamente</button></section></div>
}
