import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { listEvaluations } from '@/services/evaluations'
import { listStudents } from '@/services/students'

export default async function EvolutionPage() {
  const [evaluations, students] = await Promise.all([listEvaluations(), listStudents()])
  const names = new Map(students.map((student) => [student.id, student.full_name]))
  return <><PageHeader title="Evolução" description="Avaliações e resultados dos alunos." action={<Link className="button" href="/evolution/new">+ Nova avaliação</Link>} /><section className="panel">{evaluations.length ? <div className="student-list">{evaluations.map((evaluation) => <Link className="student-row" href={`/evolution/${evaluation.id}`} key={evaluation.id}><div><strong>{names.get(evaluation.student_id) || 'Aluno indisponível'}</strong><span>{evaluation.type} · {new Date(`${evaluation.date}T00:00:00`).toLocaleDateString('pt-BR')}</span></div></Link>)}</div> : <div className="empty-state"><h2>Nenhuma avaliação cadastrada</h2><p>Registre a primeira avaliação para acompanhar a evolução.</p></div>}</section></>
}
