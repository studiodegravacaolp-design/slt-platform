import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StudentStatus } from '@/components/students/student-status'
import { listStudents } from '@/services/students'

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const students = await listStudents({ search: q })
  return <><PageHeader title="Alunos" description="Gerencie os registros esportivos da sua organização." action={<Link className="button" href="/students/new">+ Novo aluno</Link>} /><section className="panel students-panel"><form className="search-form"><input name="q" type="search" defaultValue={q} placeholder="Pesquisar por nome" aria-label="Pesquisar alunos" /><button type="submit">Pesquisar</button></form>{students.length === 0 ? <div className="empty-state"><h2>{q ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}</h2><p>{q ? 'Tente uma busca diferente.' : 'Cadastre o primeiro aluno da organização para começar.'}</p></div> : <div className="student-list">{students.map((student) => <Link href={`/students/${student.id}`} className="student-row" key={student.id}><div><strong>{student.social_name || student.full_name}</strong>{student.social_name && <span>{student.full_name}</span>}<span>{student.email || student.whatsapp || student.phone || 'Sem contato informado'}</span></div><StudentStatus value={student.status} /></Link>)}</div>}</section></>
}
