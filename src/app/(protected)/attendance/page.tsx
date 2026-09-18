import { AttendanceForm } from '@/components/attendance/attendance-form'
import { AttendanceRowActions } from '@/components/attendance/attendance-row-actions'
import { PageHeader } from '@/components/page-header'
import { listAttendance } from '@/services/attendance'
import { listModalities } from '@/services/modalities'
import { listStudents } from '@/services/students'
import { listUnits } from '@/services/units'
import { checkInAttendanceAction, checkOutAttendanceAction, createAttendanceAction, updateAttendanceAction } from './actions'

function idFrom(value: string | undefined) { const id = Number(value); return Number.isInteger(id) && id > 0 ? id : undefined }

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ date?: string; student_id?: string; unit_id?: string; modality_id?: string }> }) {
  const filters = await searchParams
  const options = { date: filters.date || undefined, studentId: idFrom(filters.student_id), unitId: idFrom(filters.unit_id), modalityId: idFrom(filters.modality_id) }
  const [records, students, units, modalities] = await Promise.all([listAttendance(options), listStudents(), listUnits(), listModalities()])
  const studentsById = new Map(students.map((student) => [student.id, student]))
  const unitsById = new Map(units.map((unit) => [unit.id, unit]))
  const modalitiesById = new Map(modalities.map((modality) => [modality.id, modality]))
  return <><PageHeader title="Presença" description="Registre e acompanhe a participação dos alunos por unidade e modalidade." /><section className="panel"><form className="search-form"><input name="date" type="date" defaultValue={filters.date} aria-label="Filtrar por data" /><select name="student_id" defaultValue={filters.student_id || ''} aria-label="Filtrar por aluno"><option value="">Todos os alunos</option>{students.map((student) => <option key={student.id} value={student.id}>{student.social_name || student.full_name}</option>)}</select><select name="unit_id" defaultValue={filters.unit_id || ''} aria-label="Filtrar por unidade"><option value="">Todas as unidades</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select><select name="modality_id" defaultValue={filters.modality_id || ''} aria-label="Filtrar por modalidade"><option value="">Todas as modalidades</option>{modalities.map((modality) => <option key={modality.id} value={modality.id}>{modality.name}</option>)}</select><button type="submit">Filtrar</button></form>{records.length === 0 ? <div className="empty-state"><h2>Nenhuma presença encontrada</h2><p>Registre a primeira presença ou ajuste os filtros.</p></div> : <div className="student-list">{records.map((record) => { const student = studentsById.get(record.student_id); const unit = unitsById.get(record.unit_id); const modality = modalitiesById.get(record.modality_id); return <article className="student-row" key={record.id}><div><strong>{student?.social_name || student?.full_name || `Aluno #${record.student_id}`}</strong><span>{unit?.name || `Unidade #${record.unit_id}`} · {modality?.name || `Modalidade #${record.modality_id}`}</span><span>{new Date(`${record.date}T00:00:00`).toLocaleDateString('pt-BR')} · Entrada: {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'} · Saída: {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>{record.observation && <span>{record.observation}</span>}</div><AttendanceRowActions status={record.status} updateAction={updateAttendanceAction.bind(null, record.id)} checkInAction={checkInAttendanceAction.bind(null, record.id)} checkOutAction={checkOutAttendanceAction.bind(null, record.id)} /></article> })}</div>}</section><AttendanceForm students={students} units={units} modalities={modalities} action={createAttendanceAction} /></>
}
