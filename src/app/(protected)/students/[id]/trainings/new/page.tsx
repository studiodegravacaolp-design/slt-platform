import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TrainingContextSelect } from '@/components/trainings/training-context-select'
import { TrainingCreateSubmitButton } from '@/components/trainings/training-create-submit-button'
import { TrainingOperationalForm } from '@/components/trainings/training-operational-form'
import { listActiveModalities } from '@/services/modalities'
import { getStudent } from '@/services/students'
import { listActiveStudentModalityUnits } from '@/services/student-modality-units'
import { listActiveUnits } from '@/services/units'
import { createTrainingAction } from '../../../../trainings/actions'
import { trainingStatusLabels } from '@/validations/training-plan'

export default async function NewTraining({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let student
  try { student = await getStudent(id) } catch { notFound() }
  const [contexts, units, modalities] = await Promise.all([listActiveStudentModalityUnits(id), listActiveUnits(), listActiveModalities()])
  return <><Link href={`/students/${id}`}>← {student.full_name}</Link><h1>Novo treinamento</h1>{contexts.length === 0 ? <section className="panel"><p>Cadastre um vínculo esportivo ativo de unidade e modalidade antes de prescrever um treinamento.</p><Link className="button" href={`/students/${id}/sports/new`}>Cadastrar vínculo esportivo</Link></section> : <TrainingOperationalForm action={createTrainingAction.bind(null, id)} className="student-form" successMessage="Treinamento criado com sucesso."><TrainingContextSelect contexts={contexts} units={units} modalities={modalities} /><label>Nome<input name="name" required /></label><label>Descrição<textarea name="description" /></label><label>Objetivo<input name="objective" /></label><label>Observações<textarea name="observations" /></label><label>Início<input name="start_date" type="date" /></label><label>Fim<input name="end_date" type="date" /></label><label>Status<select name="status" defaultValue="active"><option value="active">{trainingStatusLabels.active}</option><option value="inactive">{trainingStatusLabels.inactive}</option></select></label><TrainingCreateSubmitButton /></TrainingOperationalForm>}</>
}
