'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { UnitModalityFields, type ContextModality, type ContextUnit } from '@/components/unit-modality-fields'

type Student = { id: number; full_name: string; social_name: string | null }
type State = { message?: string; status: 'idle' | 'error' }
const initialState: State = { status: 'idle' }

export function EvaluationCreateForm({ action, modalities, students, units }: Readonly<{
  action: (formData: FormData) => Promise<number>
  modalities: ContextModality[]
  students: Student[]
  units: ContextUnit[]
}>) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(async (_state: State, formData: FormData): Promise<State> => {
    try { const id = await action(formData); router.push(`/evolution/${id}`); return { status: 'idle' } } catch { return { status: 'error', message: 'Não foi possível criar a avaliação. Tente novamente.' } }
  }, initialState)
  return <form action={formAction} className="student-form"><section className="form-section"><div className="form-grid"><label>Aluno *<select name="student_id" required defaultValue=""><option value="" disabled>Selecione</option>{students.map((student) => <option key={student.id} value={student.id}>{student.social_name || student.full_name}</option>)}</select></label><UnitModalityFields units={units} modalities={modalities} /><label>Data *<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label><label>Tipo *<input name="type" required /></label></div></section>{state.message && <p className="form-error" role="alert">{state.message}</p>}<div className="form-actions"><button disabled={pending}>{pending ? 'Criando...' : 'Criar avaliação'}</button></div></form>
}
