import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { listStudents } from '@/services/students'
import { listTrainings } from '@/services/trainings'
import { trainingStatusLabel } from '@/validations/training-plan'

export default async function TrainingsPage() {
  const [students, trainings] = await Promise.all([listStudents(), listTrainings()])
  const studentsById = new Map(students.map((student) => [student.id, student]))

  return <>
    <PageHeader
      title="Treinamentos"
      description="Acompanhe as prescrições e acesse os detalhes de cada treino."
      action={<Link className="button" href="/students">Prescrever treino</Link>}
    />
    <section className="panel">
      <h2>Treinos cadastrados</h2>
      {trainings.length ? <ul>
        {trainings.map((training) => {
          const student = studentsById.get(training.student_modality_units.student_id)
          return <li key={training.id}>
            <Link href={`/trainings/${training.id}`}>{training.name}</Link>
            <span> · {student?.social_name || student?.full_name || 'Aluno não disponível'} · {trainingStatusLabel(training.status)}</span>
          </li>
        })}
      </ul> : <p>Nenhum treinamento cadastrado. <Link href="/students">Selecione um aluno para prescrever o primeiro treino.</Link></p>}
    </section>
  </>
}
