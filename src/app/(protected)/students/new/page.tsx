import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StudentForm } from '@/components/students/student-form'
import { createStudentAction } from '../actions'
import styles from '../students.module.css'
export default function NewStudentPage() { return <div className={styles.formPage}><PageHeader title="Novo aluno" description="Cadastre os dados pessoais, de contato e esportivos." eyebrow="SLT Free · Gestão de alunos" action={<Link className="button" href="/students">← Alunos</Link>} /><StudentForm action={createStudentAction} /></div> }
