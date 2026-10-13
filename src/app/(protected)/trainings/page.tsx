import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { listModalities } from '@/services/modalities'
import { listStudentModalityUnits } from '@/services/student-modality-units'
import { listStudents } from '@/services/students'
import { listTrainings } from '@/services/trainings'
import { listUnits } from '@/services/units'
import { trainingStatusLabel } from '@/validations/training-plan'
import styles from './trainings.module.css'

export default async function TrainingsPage() {
  const [students, trainings, units, modalities] = await Promise.all([listStudents(), listTrainings(), listUnits(), listModalities()])
  const studentsById = new Map(students.map((student) => [student.id, student]))
  const unitsById = new Map(units.map((unit) => [unit.id, unit]))
  const modalitiesById = new Map(modalities.map((modality) => [modality.id, modality]))
  const studentIds = [...new Set(trainings.map((training) => training.student_modality_units.student_id))]
  const sportContexts = (await Promise.all(studentIds.map((studentId) => listStudentModalityUnits(studentId)))).flat()
  const contextsById = new Map(sportContexts.map((context) => [context.id, context]))

  return <div className={styles.page}>
    <PageHeader
      title="Treinos"
      description="Acompanhe as prescrições e acesse os detalhes de cada treino."
      eyebrow="SLT Free · Organização"
      badge="SLT Free"
      action={<Link className="button" href="/students">Prescrever treino</Link>}
    />
    <section className={`panel ${styles.tablePanel}`}>
      {trainings.length ? <table className={styles.table}>
        <caption className={styles.tableCaption}>Treinos cadastrados</caption>
        <thead><tr><th scope="col">Treino</th><th scope="col">Aluno</th><th scope="col">Unidade / Modalidade</th><th scope="col">Situação</th><th scope="col">Ação</th></tr></thead>
        <tbody>
        {trainings.map((training) => {
          const student = studentsById.get(training.student_modality_units.student_id)
          const context = contextsById.get(training.student_modality_unit_id)
          const unit = context ? unitsById.get(context.unit_id) : undefined
          const modality = context ? modalitiesById.get(context.modality_id) : undefined
          return <tr key={training.id}>
            <td><Link className={styles.trainingName} href={`/trainings/${training.id}`}>{training.name}</Link>{training.objective ? <span className={styles.trainingDescription}>{training.objective}</span> : null}</td>
            <td>{student?.social_name || student?.full_name || 'Aluno não disponível'}</td>
            <td>{unit && modality ? <><strong>{unit.name}</strong><span className={styles.contextDetail}>{modality.name}</span></> : <span className={styles.contextDetail}>Contexto indisponível</span>}</td>
            <td><span className={`${styles.status} ${training.status === 'active' ? styles.active : styles.inactive}`}>{trainingStatusLabel(training.status)}</span></td>
            <td><Link className={styles.action} href={`/trainings/${training.id}`}>Ver detalhes</Link></td>
          </tr>
        })}
        </tbody>
      </table> : <div className="loading-state"><p className={styles.empty}>Nenhum treinamento cadastrado. <Link href="/students">Selecione um aluno para prescrever o primeiro treino.</Link></p></div>}
    </section>
  </div>
}
