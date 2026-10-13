import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StudentStatus } from '@/components/students/student-status'
import { listStudents } from '@/services/students'
import styles from './students.module.css'

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const students = await listStudents({ search: q })
  return <div className={styles.page}>
    <PageHeader title="Alunos" description="Consulte e gerencie os alunos da sua organização." eyebrow="SLT Free · Gestão de alunos" badge="SLT Free" action={<Link className="button" href="/students/new">+ Novo aluno</Link>} />
    <section className={`panel ${styles.tablePanel}`}>
      <form className={styles.toolbar}>
        <label className={styles.toolbarLabel} htmlFor="student-search">Pesquisar por nome</label>
        <div className={styles.searchRow}><input id="student-search" name="q" type="search" defaultValue={q} placeholder="Digite o nome do aluno…" /><button type="submit">Pesquisar</button></div>
      </form>
      {students.length === 0 ? <div className="empty-state"><h2>{q ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}</h2><p>{q ? 'Tente uma busca diferente.' : 'Cadastre o primeiro aluno da organização para começar.'}</p></div> : <table className={styles.table}>
        <thead><tr><th>Aluno</th><th>Contato</th><th>Situação</th><th>Ação</th></tr></thead>
        <tbody>{students.map((student) => <tr key={student.id}>
          <td><strong className={styles.studentName}>{student.social_name || student.full_name}</strong>{student.social_name ? <span className={styles.legalName}>{student.full_name}</span> : null}</td>
          <td><span className={styles.contact}>{student.email || student.whatsapp || student.phone || 'Sem contato informado'}</span></td>
          <td><StudentStatus value={student.status} /></td>
          <td><Link className={styles.action} href={`/students/${student.id}`}>Ver perfil →</Link></td>
        </tr>)}</tbody>
      </table>}
    </section>
    <p className={`muted-note ${styles.note}`}>A pesquisa utiliza o nome completo. Filtros avançados e exclusão não estão disponíveis nesta versão.</p>
  </div>
}
