import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTraining } from '@/services/trainings'
import { saveTrainingAction } from '../../actions'

export default async function EditTraining({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let training
  try { training = await getTraining(id) } catch { notFound() }
  return <><Link href={`/trainings/${id}`}>← Treinamento</Link><h1>Editar treinamento</h1><form action={saveTrainingAction.bind(null, id)} className="student-form"><label>Nome<input name="name" defaultValue={training.name} /></label><label>Descrição<textarea name="description" defaultValue={training.description ?? ''} /></label><label>Objetivo<input name="objective" defaultValue={training.objective ?? ''} /></label><label>Observações<textarea name="observations" defaultValue={training.observations ?? ''} /></label><label>Início<input name="start_date" type="date" defaultValue={training.start_date ?? ''} /></label><label>Fim<input name="end_date" type="date" defaultValue={training.end_date ?? ''} /></label><label>Status<input name="status" defaultValue={training.status} /></label><button>Salvar</button></form></>
}
