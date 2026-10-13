import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { TrainingContextSelect } from '@/components/trainings/training-context-select'
import { TrainingCreateSubmitButton } from '@/components/trainings/training-create-submit-button'
import { TrainingOperationalForm } from '@/components/trainings/training-operational-form'
import { listActiveModalities } from '@/services/modalities'
import { getStudent } from '@/services/students'
import { listActiveStudentModalityUnits } from '@/services/student-modality-units'
import { listActiveUnits } from '@/services/units'
import { trainingStatusLabels } from '@/validations/training-plan'
import { createTrainingAction } from '../../../../trainings/actions'
import styles from '../../../../trainings/trainings.module.css'

export default async function NewTraining({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let student
  try { student = await getStudent(id) } catch { notFound() }
  const [contexts, units, modalities] = await Promise.all([listActiveStudentModalityUnits(id), listActiveUnits(), listActiveModalities()])
  const studentName = student.social_name || student.full_name

  return <div className={styles.page}>
    <PageHeader title="Nova prescrição" description={`Crie um treino para ${studentName} a partir de um vínculo esportivo ativo.`} eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href={`/students/${id}`}>Voltar ao aluno</Link>} />
    {contexts.length === 0 ? <section className={`panel ${styles.formCard}`}><h2>Vínculo esportivo necessário</h2><p>Cadastre um vínculo ativo de unidade e modalidade antes de prescrever um treinamento.</p><Link className="button" href={`/students/${id}/sports/new`}>Cadastrar vínculo esportivo</Link></section> : <TrainingOperationalForm action={createTrainingAction.bind(null, id)} className={styles.trainingForm} successMessage="Treinamento criado com sucesso.">
      <section className={styles.formCard}><h2>Contexto esportivo</h2><p>Selecione a unidade e a modalidade vinculadas ao aluno.</p><div className={styles.formGrid}><TrainingContextSelect contexts={contexts} units={units} modalities={modalities} /></div></section>
      <section className={styles.formCard}><h2>Dados da prescrição</h2><p>Defina o objetivo, período e situação inicial do treino.</p><div className={styles.formGrid}>
        <label className={styles.wide}>Nome *<input name="name" required /></label><label className={styles.wide}>Descrição<textarea name="description" /></label><label>Objetivo<input name="objective" /></label><label>Status<select name="status" defaultValue="active"><option value="active">{trainingStatusLabels.active}</option><option value="inactive">{trainingStatusLabels.inactive}</option></select></label><label>Início<input name="start_date" type="date" /></label><label>Fim<input name="end_date" type="date" /></label><label className={styles.wide}>Observações<textarea name="observations" /></label>
      </div></section>
      <div className={styles.formActions}><TrainingCreateSubmitButton /></div>
    </TrainingOperationalForm>}
  </div>
}
