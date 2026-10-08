import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTraining } from '@/services/trainings'
import { trainingStatusLabels } from '@/validations/training-plan'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { saveTrainingAction } from '../../actions'

export default async function EditTraining({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let training
  try { training = await getTraining(id) } catch { notFound() }
  return <><Link href={`/trainings/${id}`}>← Treinamento</Link><h1>Editar treinamento</h1><OperationalForm action={saveTrainingAction.bind(null, id)} className="student-form" successMessage="Treinamento atualizado com sucesso."><label>Nome<input name="name" required defaultValue={training.name} /></label><label>Descrição<textarea name="description" defaultValue={training.description ?? ''} /></label><label>Objetivo<input name="objective" defaultValue={training.objective ?? ''} /></label><label>Observações<textarea name="observations" defaultValue={training.observations ?? ''} /></label><label>Início<input name="start_date" type="date" defaultValue={training.start_date ?? ''} /></label><label>Fim<input name="end_date" type="date" defaultValue={training.end_date ?? ''} /></label><label>Status<select name="status" defaultValue={training.status}><option value="active">{trainingStatusLabels.active}</option><option value="inactive">{trainingStatusLabels.inactive}</option></select></label><OperationalSubmitButton idleLabel="Salvar" pendingLabel="Salvando..." /></OperationalForm></>
}
