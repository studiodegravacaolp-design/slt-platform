import Link from 'next/link'
import { redirect } from 'next/navigation'
import { listModalities } from '@/services/modalities'
import { listStudents } from '@/services/students'
import { listUnits } from '@/services/units'
import { createEvaluationAction } from '../actions'

export default async function NewEvaluationPage() {
  const [students, units, modalities] = await Promise.all([listStudents(), listUnits(), listModalities()])
  async function action(formData: FormData) { 'use server'; const id = await createEvaluationAction(formData); redirect(`/evolution/${id}`) }
  return <><Link href="/evolution">← Evolução</Link><h1>Nova avaliação</h1><form action={action} className="student-form"><section className="form-section"><div className="form-grid"><label>Aluno *<select name="student_id" required defaultValue=""><option value="" disabled>Selecione</option>{students.map(s=><option key={s.id} value={s.id}>{s.social_name||s.full_name}</option>)}</select></label><label>Unidade *<select name="unit_id" required defaultValue=""><option value="" disabled>Selecione</option>{units.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label><label>Modalidade *<select name="modality_id" required defaultValue=""><option value="" disabled>Selecione</option>{modalities.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Data *<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0,10)} /></label><label>Tipo *<input name="type" required /></label></div></section><div className="form-actions"><button>Criar avaliação</button></div></form></>
}
