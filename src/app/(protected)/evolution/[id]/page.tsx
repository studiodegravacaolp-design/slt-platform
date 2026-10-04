import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmitButton } from '@/components/confirm-submit-button'
import { OperationalForm, OperationalSubmitButton } from '@/components/operational-form'
import { createClient } from '@/lib/supabase/server'
import { getEvaluation, listEvaluationResults } from '@/services/evaluations'
import { listModalities } from '@/services/modalities'
import { listStudents } from '@/services/students'
import { listUnits } from '@/services/units'
import { addEvaluationResultAction, removeEvaluationResultAction, updateEvaluationAction, updateEvaluationResultAction } from '../actions'

export default async function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  let evaluation
  try { evaluation = await getEvaluation(id) } catch { notFound() }
  const [results, students, units, modalities] = await Promise.all([listEvaluationResults(id), listStudents(), listUnits(), listModalities()])
  const supabase = await createClient()
  const { data: user } = await supabase.from('users').select('name').eq('id', evaluation.responsible_user_id).single()
  const student = students.find((item) => item.id === evaluation.student_id)
  const unit = units.find((item) => item.id === evaluation.unit_id)
  const modality = modalities.find((item) => item.id === evaluation.modality_id)
  return <><Link href="/evolution">← Evolução</Link><h1>{evaluation.type}</h1><section className="panel"><p>{student?.full_name || 'Aluno indisponível'} · {unit?.name || 'Unidade indisponível'} · {modality?.name || 'Modalidade indisponível'}</p><p>{new Date(`${evaluation.date}T00:00:00`).toLocaleDateString('pt-BR')} · Responsável: {user?.name || 'Não informado'}</p><OperationalForm action={updateEvaluationAction.bind(null, id)} className="student-form" successMessage="Avaliação atualizada com sucesso."><label>Data<input name="date" type="date" defaultValue={evaluation.date} /></label><label>Tipo<input name="type" defaultValue={evaluation.type} /></label><OperationalSubmitButton idleLabel="Salvar avaliação" pendingLabel="Salvando..." /></OperationalForm></section><section className="panel"><h2>Resultados</h2>{results.length ? <ul>{results.map((result) => <li key={result.id}><details><summary>{result.metric}: {result.value} {result.unit_of_measure || ''}</summary><OperationalForm action={updateEvaluationResultAction.bind(null, id, result.id)} className="student-form" successMessage="Resultado atualizado com sucesso."><label>Métrica<input name="metric" defaultValue={result.metric} /></label><label>Valor<input name="value" defaultValue={result.value} /></label><label>Unidade<input name="unit_of_measure" defaultValue={result.unit_of_measure || ''} /></label><label>Observação<textarea name="observation" defaultValue={result.observation || ''} /></label><OperationalSubmitButton idleLabel="Salvar resultado" pendingLabel="Salvando..." /></OperationalForm></details><OperationalForm action={removeEvaluationResultAction.bind(null, id)} successMessage="Resultado removido com sucesso."><input type="hidden" name="result_id" value={result.id} /><ConfirmSubmitButton message="Remover este resultado? Esta ação não pode ser desfeita.">Remover</ConfirmSubmitButton></OperationalForm></li>)}</ul> : <p>Nenhum resultado registrado.</p>}<OperationalForm action={addEvaluationResultAction.bind(null, id)} className="student-form" successMessage="Resultado adicionado com sucesso."><h2>Adicionar resultado</h2><label>Métrica<input name="metric" required /></label><label>Valor<input name="value" required /></label><label>Unidade de medida<input name="unit_of_measure" /></label><label>Observação<textarea name="observation" /></label><OperationalSubmitButton idleLabel="Adicionar resultado" pendingLabel="Adicionando..." /></OperationalForm></section></>
}
