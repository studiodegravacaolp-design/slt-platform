import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OperationalSubmitButton } from '@/components/operational-form'
import { PageHeader } from '@/components/page-header'
import { TrainingOperationalForm } from '@/components/trainings/training-operational-form'
import { getTraining } from '@/services/trainings'
import { trainingStatusLabels } from '@/validations/training-plan'
import { saveTrainingAction } from '../../actions'
import styles from '../../trainings.module.css'

export default async function EditTraining({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let training
  try { training = await getTraining(id) } catch { notFound() }

  return <div className={styles.page}>
    <PageHeader title="Editar treino" description="Atualize os dados da prescrição mantendo o contexto esportivo original." eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href={`/trainings/${id}`}>Voltar ao treino</Link>} />
    <TrainingOperationalForm action={saveTrainingAction.bind(null, id)} className={styles.trainingForm} successMessage="Treinamento atualizado com sucesso.">
      <section className={styles.formCard}><h2>Dados gerais</h2><p>O aluno, a unidade e a modalidade deste treino não podem ser alterados nesta tela.</p><div className={styles.formGrid}>
        <label className={styles.wide}>Nome *<input name="name" required defaultValue={training.name} /></label><label className={styles.wide}>Descrição<textarea name="description" defaultValue={training.description ?? ''} /></label><label>Objetivo<input name="objective" defaultValue={training.objective ?? ''} /></label><label>Status<select name="status" defaultValue={training.status}><option value="active">{trainingStatusLabels.active}</option><option value="inactive">{trainingStatusLabels.inactive}</option></select></label><label>Início<input name="start_date" type="date" defaultValue={training.start_date ?? ''} /></label><label>Fim<input name="end_date" type="date" defaultValue={training.end_date ?? ''} /></label><label className={styles.wide}>Observações<textarea name="observations" defaultValue={training.observations ?? ''} /></label>
      </div></section>
      <div className={styles.formActions}><OperationalSubmitButton idleLabel="Salvar alterações" pendingLabel="Salvando..." /></div>
    </TrainingOperationalForm>
  </div>
}
