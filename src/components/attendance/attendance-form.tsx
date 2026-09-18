'use client'

import { useActionState } from 'react'
import type { AttendanceFormState } from '@/app/(protected)/attendance/actions'
import type { Modality } from '@/services/modalities'
import type { Student } from '@/services/students'
import type { Unit } from '@/services/units'

const initialState: AttendanceFormState = { status: 'idle' }

type AttendanceFormProps = { students: Student[]; units: Unit[]; modalities: Modality[]; action: (state: AttendanceFormState, formData: FormData) => Promise<AttendanceFormState> }

export function AttendanceForm({ students, units, modalities, action }: Readonly<AttendanceFormProps>) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const fieldError = (field: string) => state.fieldErrors?.[field]?.[0]
  return <form action={formAction} className="student-form">
    <section className="form-section"><h2>Registrar presença</h2><div className="form-grid">
      <label>Aluno *<select name="student_id" required defaultValue=""><option value="" disabled>Selecione</option>{students.map((student) => <option key={student.id} value={student.id}>{student.social_name || student.full_name}</option>)}</select>{fieldError('student_id') && <small>{fieldError('student_id')}</small>}</label>
      <label>Unidade *<select name="unit_id" required defaultValue=""><option value="" disabled>Selecione</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select>{fieldError('unit_id') && <small>{fieldError('unit_id')}</small>}</label>
      <label>Modalidade *<select name="modality_id" required defaultValue=""><option value="" disabled>Selecione</option>{modalities.map((modality) => <option key={modality.id} value={modality.id}>{modality.name}</option>)}</select>{fieldError('modality_id') && <small>{fieldError('modality_id')}</small>}</label>
      <label>Data *<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />{fieldError('date') && <small>{fieldError('date')}</small>}</label>
      <label>Status *<input name="status" required placeholder="Informe o status" />{fieldError('status') && <small>{fieldError('status')}</small>}</label>
      <label className="span-2">Observação<textarea name="observation" /></label>
    </div></section>
    {state.message && <p className={state.status === 'error' ? 'form-error' : 'form-success'} role="status">{state.message}</p>}
    <div className="form-actions"><button type="submit" disabled={pending}>{pending ? 'Registrando...' : 'Registrar presença'}</button></div>
  </form>
}
