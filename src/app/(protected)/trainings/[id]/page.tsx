import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmitButton } from '@/components/confirm-submit-button'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { getTraining, listTrainingExercises } from '@/services/trainings'
import { addExerciseAction, orderExercisesAction, removeExerciseAction, statusTrainingAction, updateExerciseAction } from '../actions'

export default async function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let training
  try { training = await getTraining(id) } catch { notFound() }
  const exercises = await listTrainingExercises(id)
  return <>
    <Link href="/trainings">← Treinamentos</Link> <Link href={`/trainings/${id}/edit`}>Editar treinamento</Link>
    <h1>{training.name}</h1><p>{training.description}</p>
    <OperationalForm action={statusTrainingAction.bind(null, id)} successMessage="Status atualizado com sucesso."><label>Status <input name="status" defaultValue={training.status} /></label><OperationalSubmitButton idleLabel="Atualizar status" pendingLabel="Atualizando..." /></OperationalForm>
    <section className="panel"><h2>Exercícios</h2>{exercises.length ? <ol>{exercises.map((exercise, index) => {
      const ids = exercises.map((item) => item.id)
      const moveUp = index > 0 ? [...ids.slice(0, index - 1), ids[index], ids[index - 1], ...ids.slice(index + 1)] : ids
      const moveDown = index < ids.length - 1 ? [...ids.slice(0, index), ids[index + 1], ids[index], ...ids.slice(index + 2)] : ids
      return <li key={exercise.id}><details><summary>{exercise.order + 1}. {exercise.exercise_name}</summary><OperationalForm action={updateExerciseAction.bind(null, id, exercise.id)} className="student-form" successMessage="Exercício atualizado com sucesso."><label>Exercício<input name="exercise_name" defaultValue={exercise.exercise_name} /></label><label>Séries<input name="sets" type="number" defaultValue={exercise.sets ?? ''} /></label><label>Repetições<input name="repetitions" type="number" defaultValue={exercise.repetitions ?? ''} /></label><label>Carga<input name="load" type="number" defaultValue={exercise.load ?? ''} /></label><label>Descanso<input name="rest_time" type="number" defaultValue={exercise.rest_time ?? ''} /></label><label>Duração<input name="duration" type="number" defaultValue={exercise.duration ?? ''} /></label><label>Intensidade<select name="intensity" defaultValue={exercise.intensity ?? ''}><option value="">Padrão</option><option>leve</option><option>moderada</option><option>alta</option></select></label><label>Observações<textarea name="observations" defaultValue={exercise.observations ?? ''} /></label><input type="hidden" name="order" value={exercise.order} /><OperationalSubmitButton idleLabel="Salvar exercício" pendingLabel="Salvando..." /></OperationalForm></details><OperationalForm action={orderExercisesAction.bind(null, id)} successMessage="Ordem atualizada com sucesso."><input type="hidden" name="ids" value={moveUp.join(',')} /><OperationalSubmitButton idleLabel="Subir" pendingLabel="Atualizando..." /></OperationalForm><OperationalForm action={orderExercisesAction.bind(null, id)} successMessage="Ordem atualizada com sucesso."><input type="hidden" name="ids" value={moveDown.join(',')} /><OperationalSubmitButton idleLabel="Descer" pendingLabel="Atualizando..." /></OperationalForm><OperationalForm action={removeExerciseAction.bind(null, id)} successMessage="Exercício removido com sucesso."><input type="hidden" name="exercise_id" value={exercise.id} /><ConfirmSubmitButton message="Remover este exercício? Esta ação não pode ser desfeita.">Remover</ConfirmSubmitButton></OperationalForm></li>
    })}</ol> : <p>Nenhum exercício.</p>}</section>
    <OperationalForm action={addExerciseAction.bind(null, id)} className="student-form" successMessage="Exercício adicionado com sucesso."><h2>Adicionar exercício</h2><label>Exercício<input name="exercise_name" required /></label><label>Ordem<input name="order" type="number" min="0" defaultValue={exercises.length} /></label><label>Séries<input name="sets" type="number" /></label><label>Repetições<input name="repetitions" type="number" /></label><label>Descanso<input name="rest_time" type="number" /></label><label>Duração<input name="duration" type="number" /></label><label>Intensidade<select name="intensity"><option value="">Padrão</option><option>leve</option><option>moderada</option><option>alta</option></select></label><OperationalSubmitButton idleLabel="Adicionar" pendingLabel="Adicionando..." /></OperationalForm>
  </>
}
