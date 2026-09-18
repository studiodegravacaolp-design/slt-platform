import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StudentSportForm } from '@/components/students/student-sport-form'
import { listModalities } from '@/services/modalities'
import { getStudent } from '@/services/students'
import { listUnits } from '@/services/units'
import { createStudentModalityUnitAction } from '../../../actions'
export default async function NewStudentSportPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const studentId = Number(id); if (!Number.isInteger(studentId) || studentId < 1) notFound(); let student; try { student = await getStudent(studentId) } catch { notFound() }; const [units, modalities] = await Promise.all([listUnits(), listModalities()]); return <><header className="subpage-header"><div><Link href={`/students/${student.id}`}>← Perfil do aluno</Link><h1>Novo vínculo esportivo</h1><p>{student.social_name || student.full_name}</p></div></header><StudentSportForm units={units} modalities={modalities} action={createStudentModalityUnitAction.bind(null, student.id)} /></> }
