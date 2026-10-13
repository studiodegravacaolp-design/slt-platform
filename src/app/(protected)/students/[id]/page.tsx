import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StudentStatus } from '@/components/students/student-status'
import { listModalities } from '@/services/modalities'
import { getStudent } from '@/services/students'
import { listStudentModalityUnits } from '@/services/student-modality-units'
import { listTrainingsByStudent } from '@/services/trainings'
import { listUnits } from '@/services/units'
import { trainingStatusLabel } from '@/validations/training-plan'
import styles from '../students.module.css'

function dateLabel(value: string | null) { return value ? new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR') : 'Não informado' }
function valueOrNotInformed(value: string | null) { return value || 'Não informado' }

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const studentId = Number(id)
  if (!Number.isInteger(studentId) || studentId < 1) notFound()
  let student
  try { student = await getStudent(studentId) } catch { notFound() }
  const [sports, trainings, units, modalities] = await Promise.all([listStudentModalityUnits(student.id), listTrainingsByStudent(student.id), listUnits(), listModalities()])
  const unitNames = new Map(units.map((unit) => [unit.id, unit.name]))
  const modalityNames = new Map(modalities.map((modality) => [modality.id, modality.name]))
  return <div className={styles.profilePage}>
    <header className="page-header page-header-featured"><div><p className="page-header-eyebrow">SLT Free · Gestão de alunos</p><h1>{student.social_name || student.full_name}</h1>{student.social_name ? <p>{student.full_name}</p> : <p>Perfil e informações operacionais do aluno.</p>}</div><div className={styles.actionGroup}><Link className="button" href={`/students/${student.id}/trainings/new`}>Prescrever treino</Link><Link className="button" href={`/students/${student.id}/financial`}>Financeiro</Link><Link className="button" href={`/students/${student.id}/edit`}>Editar aluno</Link><Link className="button" href="/students">← Alunos</Link></div></header>
    <div className={styles.profileCards}>
      <section className={`panel ${styles.detailCard}`}><h2>Dados cadastrais</h2><dl className={styles.dataGrid}><div><dt>Nome completo</dt><dd>{student.full_name}</dd></div><div><dt>Nome social</dt><dd>{valueOrNotInformed(student.social_name)}</dd></div><div><dt>Situação</dt><dd><StudentStatus value={student.status} /></dd></div><div><dt>Data de nascimento</dt><dd>{dateLabel(student.birth_date)}</dd></div><div><dt>CPF</dt><dd>{valueOrNotInformed(student.cpf)}</dd></div><div><dt>Sexo</dt><dd>{valueOrNotInformed(student.sex)}</dd></div><div><dt>Foto</dt><dd>{student.photo ? 'URL cadastrada' : 'Não informada'}</dd></div></dl></section>
      <section className={`panel ${styles.detailCard}`}><h2>Contato</h2><dl className={styles.dataGrid}><div><dt>E-mail</dt><dd>{valueOrNotInformed(student.email)}</dd></div><div><dt>Telefone</dt><dd>{valueOrNotInformed(student.phone)}</dd></div><div><dt>WhatsApp</dt><dd>{valueOrNotInformed(student.whatsapp)}</dd></div></dl></section>
      <section className={`panel ${styles.detailCard}`}><h2>Endereço</h2><dl className={styles.dataGrid}><div><dt>CEP</dt><dd>{valueOrNotInformed(student.cep)}</dd></div><div><dt>Estado</dt><dd>{valueOrNotInformed(student.state)}</dd></div><div><dt>Município</dt><dd>{valueOrNotInformed(student.city)}</dd></div><div><dt>Bairro</dt><dd>{valueOrNotInformed(student.neighborhood)}</dd></div><div><dt>Rua</dt><dd>{valueOrNotInformed(student.street)}</dd></div><div><dt>Número</dt><dd>{valueOrNotInformed(student.number)}</dd></div><div><dt>Complemento</dt><dd>{valueOrNotInformed(student.complement)}</dd></div></dl></section>
      <section className={`panel ${styles.detailCard}`}><h2>Informações esportivas</h2><dl className={styles.dataGrid}><div><dt>Início na organização</dt><dd>{dateLabel(student.start_date)}</dd></div><div className={styles.full}><dt>Observações esportivas</dt><dd>{valueOrNotInformed(student.sports_notes)}</dd></div></dl></section>
    </div>
    <section className={`panel ${styles.profileSection}`}><div className={styles.sectionHeader}><div><h2>Vínculos esportivos</h2><p>Aluno → Unidade → Modalidade</p></div><Link className="button" href={`/students/${student.id}/sports/new`}>+ Novo vínculo esportivo</Link></div>{sports.length === 0 ? <p className="muted-note">Nenhum vínculo esportivo cadastrado.</p> : <ul className={styles.linkList}>{sports.map((sport) => <li className={styles.linkRow} key={sport.id}><div><strong>{unitNames.get(sport.unit_id) && modalityNames.get(sport.modality_id) ? `${unitNames.get(sport.unit_id)} · ${modalityNames.get(sport.modality_id)}` : 'Contexto indisponível'}</strong><small>Início: {dateLabel(sport.start_date)} · Situação: {sport.status}</small></div><StudentStatus value={sport.status} /></li>)}</ul>}</section>
    <section className={`panel ${styles.profileSection}`}><div className={styles.sectionHeader}><div><h2>Treinamentos</h2><p>Prescrições vinculadas aos contextos esportivos do aluno.</p></div><Link className="button" href={`/students/${student.id}/trainings/new`}>Prescrever treino</Link></div>{trainings.length === 0 ? <p className="muted-note">Nenhum treinamento cadastrado.</p> : <ul className={styles.linkList}>{trainings.map((training) => <li className={styles.linkRow} key={training.id}><Link href={`/trainings/${training.id}`}><strong>{training.name}</strong><small>Início: {dateLabel(training.start_date)} · Situação: {trainingStatusLabel(training.status)}</small></Link><StudentStatus value={training.status} /></li>)}</ul>}</section>
  </div>
}
