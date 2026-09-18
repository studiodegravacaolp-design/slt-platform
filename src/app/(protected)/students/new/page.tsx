import Link from 'next/link'
import { StudentForm } from '@/components/students/student-form'
import { createStudentAction } from '../actions'
export default function NewStudentPage() { return <><header className="subpage-header"><div><Link href="/students">← Alunos</Link><h1>Novo aluno</h1><p>Cadastre os dados essenciais do aluno.</p></div></header><StudentForm action={createStudentAction} /></> }
