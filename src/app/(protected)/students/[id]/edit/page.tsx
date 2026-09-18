import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StudentForm } from '@/components/students/student-form'
import { getStudent } from '@/services/students'
import { updateStudentAction } from '../../actions'
export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const studentId = Number(id); if (!Number.isInteger(studentId) || studentId < 1) notFound(); let student; try { student = await getStudent(studentId) } catch { notFound() }; return <><header className="subpage-header"><div><Link href={`/students/${student.id}`}>← Perfil do aluno</Link><h1>Editar aluno</h1><p>Atualize os dados cadastrais.</p></div></header><StudentForm student={student} action={updateStudentAction.bind(null, student.id)} /></> }
