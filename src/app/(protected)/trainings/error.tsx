'use client'

import { PageHeader } from '@/components/page-header'
import styles from './trainings.module.css'

export default function TrainingsError({ reset }: Readonly<{ reset: () => void }>) {
  return <div className={styles.page}><PageHeader title="Treinos" description="Acompanhe as prescrições e acesse os detalhes de cada treino." eyebrow="SLT Free · Organização" badge="SLT Free" /><section className="panel error-state" role="alert"><h2>Não foi possível carregar os treinos</h2><p>Tente novamente. Se o problema continuar, verifique sua conexão e tente mais tarde.</p><button type="button" onClick={reset}>Tentar novamente</button></section></div>
}
