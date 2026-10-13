import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StudentForm } from '@/components/students/student-form'
import { getStudent } from '@/services/students'
import { updateStudentAction } from '../../actions'
import styles from '../../students.module.css'
export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const studentId = Number(id); if (!Number.isInteger(studentId) || studentId < 1) notFound(); let student; try { student = await getStudent(studentId) } catch { notFound() }; return <div className={styles.formPage}><PageHeader title="Editar aluno" description="Atualize os dados cadastrais do aluno." eyebrow="SLT Free · Gestão de alunos" action={<Link className="button" href={`/students/${student.id}`}>← Perfil do aluno</Link>} /><StudentForm student={student} action={updateStudentAction.bind(null, student.id)} /></div> }
