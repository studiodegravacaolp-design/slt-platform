import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmitButton } from '@/components/confirm-submit-button'
import { OperationalSubmitButton } from '@/components/operational-form'
import { PageHeader } from '@/components/page-header'
import { TrainingOperationalForm } from '@/components/trainings/training-operational-form'
import { getModality } from '@/services/modalities'
import { listStudentModalityUnits } from '@/services/student-modality-units'
import { getStudent } from '@/services/students'
import { getTraining, listTrainingExercises, listTrainings } from '@/services/trainings'
import { getUnit } from '@/services/units'
import { trainingStatusLabel, trainingStatusLabels } from '@/validations/training-plan'
import { addExerciseAction, orderExercisesAction, removeExerciseAction, statusTrainingAction, updateExerciseAction } from '../actions'
import styles from '../trainings.module.css'

const intensityLabels: Record<string, string> = { leve: 'Leve', moderada: 'Moderada', alta: 'Alta' }

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : 'Não informado'
}

export default async function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let training
  try { training = await getTraining(id) } catch { notFound() }

  const [exercises, trainingReferences] = await Promise.all([listTrainingExercises(id), listTrainings()])
  const reference = trainingReferences.find((item) => item.id === id)
  const studentId = reference?.student_modality_units.student_id
  const [student, contexts] = await Promise.all([
    studentId ? getStudent(studentId).catch(() => null) : Promise.resolve(null),
    studentId ? listStudentModalityUnits(studentId).catch(() => []) : Promise.resolve([]),
  ])
  const context = contexts.find((item) => item.id === training.student_modality_unit_id)
  const [unit, modality] = context
    ? await Promise.all([getUnit(context.unit_id).catch(() => null), getModality(context.modality_id).catch(() => null)])
    : [null, null]
  const exerciseIds = exercises.map((exercise) => exercise.id)

  return <div className={styles.page}>
    <PageHeader
      title={training.name}
      description="Consulte a prescrição, o contexto esportivo e os exercícios deste treino."
      eyebrow="SLT Free · Organização"
      badge="SLT Free"
      action={<div className={styles.headerActions}><Link className="button" href={`/trainings/${id}/edit`}>Editar treino</Link></div>}
    />
    <Link className={styles.backLink} href="/trainings">← Voltar para treinos</Link>

    <div className={styles.detailGrid}>
      <section className={`panel ${styles.detailCard}`}>
        <h2>Resumo da prescrição</h2>
        <dl className={styles.dataGrid}>
          <div><dt>Objetivo</dt><dd>{training.objective || 'Não informado'}</dd></div>
          <div><dt>Período</dt><dd>{formatDate(training.start_date)}{training.end_date ? ` até ${formatDate(training.end_date)}` : ''}</dd></div>
          {training.description ? <div><dt>Descrição</dt><dd>{training.description}</dd></div> : null}
          {training.observations ? <div><dt>Observações</dt><dd>{training.observations}</dd></div> : null}
        </dl>
      </section>
      <section className={`panel ${styles.detailCard}`}>
        <h2>Aluno e contexto esportivo</h2>
        <dl className={styles.dataGrid}>
          <div><dt>Aluno</dt><dd>{student?.social_name || student?.full_name || 'Aluno indisponível'}</dd></div>
          <div><dt>Unidade</dt><dd>{unit?.name || 'Contexto indisponível'}</dd></div>
          <div><dt>Modalidade</dt><dd>{modality?.name || 'Contexto indisponível'}</dd></div>
          <div><dt>Vínculo esportivo</dt><dd>{context?.status === 'active' ? 'Ativo' : context ? 'Inativo' : 'Indisponível'}</dd></div>
        </dl>
      </section>
    </div>

    <section className={`panel ${styles.statusPanel}`}>
      <div><h2>Situação e informações gerais</h2><p className={styles.statusSummary}>Situação atual: <span className={`${styles.status} ${training.status === 'active' ? styles.active : styles.inactive}`}>{trainingStatusLabel(training.status)}</span></p></div>
      <TrainingOperationalForm action={statusTrainingAction.bind(null, id)} className={styles.statusForm} successMessage="Status atualizado com sucesso.">
        <label>Status <select name="status" defaultValue={training.status}><option value="active">{trainingStatusLabels.active}</option><option value="inactive">{trainingStatusLabels.inactive}</option></select></label>
        <OperationalSubmitButton idleLabel="Atualizar situação" pendingLabel="Atualizando..." />
      </TrainingOperationalForm>
    </section>

    <section className={`panel ${styles.exercisesPanel}`}>
      <div className={styles.sectionHeader}><div><h2>Exercícios prescritos</h2><p>Organize a sequência e mantenha os detalhes da prescrição atualizados.</p></div></div>
      {exercises.length ? <ol className={styles.exerciseList}>
        {exercises.map((exercise, index) => {
          const moveUp = index > 0 ? [...exerciseIds.slice(0, index - 1), exerciseIds[index], exerciseIds[index - 1], ...exerciseIds.slice(index + 1)] : exerciseIds
          const moveDown = index < exerciseIds.length - 1 ? [...exerciseIds.slice(0, index), exerciseIds[index + 1], exerciseIds[index], ...exerciseIds.slice(index + 2)] : exerciseIds
          const details = [
            ['Séries', exercise.sets], ['Repetições', exercise.repetitions], ['Carga', exercise.load === null ? null : `${exercise.load} kg`], ['Descanso', exercise.rest_time === null ? null : `${exercise.rest_time} s`], ['Duração', exercise.duration === null ? null : `${exercise.duration} min`], ['Intensidade', exercise.intensity ? intensityLabels[exercise.intensity] || exercise.intensity : null], ['Observações', exercise.observations],
          ].filter(([, value]) => value !== null && value !== undefined && value !== '')
          return <li className={styles.exerciseCard} key={exercise.id}>
            <div className={styles.exerciseHeader}><div><p className={styles.exerciseOrder}>Exercício {exercise.order + 1}</p><h3>{exercise.exercise_name}</h3></div><div className={styles.exerciseActions}>
              {index > 0 ? <TrainingOperationalForm action={orderExercisesAction.bind(null, id)} successMessage="Ordem atualizada com sucesso."><input type="hidden" name="ids" value={moveUp.join(',')} /><OperationalSubmitButton idleLabel="Subir" pendingLabel="Atualizando..." /></TrainingOperationalForm> : null}
              {index < exerciseIds.length - 1 ? <TrainingOperationalForm action={orderExercisesAction.bind(null, id)} successMessage="Ordem atualizada com sucesso."><input type="hidden" name="ids" value={moveDown.join(',')} /><OperationalSubmitButton idleLabel="Descer" pendingLabel="Atualizando..." /></TrainingOperationalForm> : null}
              <TrainingOperationalForm action={removeExerciseAction.bind(null, id)} successMessage="Exercício removido com sucesso."><input type="hidden" name="exercise_id" value={exercise.id} /><ConfirmSubmitButton message="Remover este exercício? Esta ação não pode ser desfeita.">Remover</ConfirmSubmitButton></TrainingOperationalForm>
            </div></div>
            {details.length ? <dl className={styles.exerciseMeta}>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : null}
            <details className={styles.exerciseDetails}><summary>Editar exercício</summary>
              <TrainingOperationalForm action={updateExerciseAction.bind(null, id, exercise.id)} className={styles.exerciseEdit} successMessage="Exercício atualizado com sucesso.">
                <div className={styles.exerciseEditGrid}>
                  <label>Exercício<input name="exercise_name" required defaultValue={exercise.exercise_name} /></label><label>Séries<input name="sets" type="number" min="1" defaultValue={exercise.sets ?? ''} /></label><label>Repetições<input name="repetitions" type="number" min="1" defaultValue={exercise.repetitions ?? ''} /></label><label>Carga (kg)<input name="load" type="number" min="0" step="any" defaultValue={exercise.load ?? ''} /></label><label>Descanso (s)<input name="rest_time" type="number" min="0" defaultValue={exercise.rest_time ?? ''} /></label><label>Duração (min)<input name="duration" type="number" min="0" defaultValue={exercise.duration ?? ''} /></label><label>Intensidade<select name="intensity" defaultValue={exercise.intensity ?? ''}><option value="">Não informada</option><option value="leve">Leve</option><option value="moderada">Moderada</option><option value="alta">Alta</option></select></label><label>Ordem<input name="order" type="number" min="0" defaultValue={exercise.order} /></label><label className={styles.wide}>Observações<textarea name="observations" defaultValue={exercise.observations ?? ''} /></label>
                </div>
                <div className={styles.formActions}><OperationalSubmitButton idleLabel="Salvar exercício" pendingLabel="Salvando..." /></div>
              </TrainingOperationalForm>
            </details>
          </li>
        })}
      </ol> : <p className={styles.empty}>Nenhum exercício foi adicionado a este treino.</p>}
    </section>

    <TrainingOperationalForm action={addExerciseAction.bind(null, id)} className={`${styles.trainingForm} ${styles.addExercise}`} successMessage="Exercício adicionado com sucesso.">
      <section className={styles.formCard}><h2>Adicionar exercício</h2><p>Preencha apenas as medidas que fazem parte desta prescrição.</p>
        <div className={styles.formGrid}>
          <label className={styles.wide}>Exercício *<input name="exercise_name" required /></label><label>Ordem<input name="order" type="number" min="0" defaultValue={exercises.length} /></label><label>Séries<input name="sets" type="number" min="1" /></label><label>Repetições<input name="repetitions" type="number" min="1" /></label><label>Carga (kg)<input name="load" type="number" min="0" step="any" /></label><label>Descanso (s)<input name="rest_time" type="number" min="0" /></label><label>Duração (min)<input name="duration" type="number" min="0" /></label><label>Intensidade<select name="intensity"><option value="">Não informada</option><option value="leve">Leve</option><option value="moderada">Moderada</option><option value="alta">Alta</option></select></label><label className={styles.wide}>Observações<textarea name="observations" /></label>
        </div>
        <div className={styles.formActions}><OperationalSubmitButton idleLabel="Adicionar exercício" pendingLabel="Adicionando..." /></div>
      </section>
    </TrainingOperationalForm>
  </div>
}
