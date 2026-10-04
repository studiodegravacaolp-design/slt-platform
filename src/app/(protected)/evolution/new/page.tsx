import Link from 'next/link'
import { EvaluationCreateForm } from '@/components/evaluation/evaluation-create-form'
import { listActiveModalities } from '@/services/modalities'
import { listStudents } from '@/services/students'
import { listActiveUnits } from '@/services/units'
import { createEvaluationAction } from '../actions'

export default async function NewEvaluationPage() {
  const [students, units, modalities] = await Promise.all([listStudents(), listActiveUnits(), listActiveModalities()])
  return <><Link href="/evolution">← Evolução</Link><h1>Nova avaliação</h1><EvaluationCreateForm action={createEvaluationAction} students={students} units={units} modalities={modalities} /></>
}
