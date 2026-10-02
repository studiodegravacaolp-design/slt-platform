import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getModality } from '@/services/modalities'
import { getUnit } from '@/services/units'
import { saveModality } from '../../actions'

export default async function ModalityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ updated?: string; error?: string }> }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) notFound()
  let modality
  let unit
  try { modality = await getModality(id); unit = await getUnit(modality.unit_id) } catch { notFound() }
  const query = await searchParams

  return <><Link href="/settings/modalities">← Modalidades</Link><h1>{modality.name}</h1><form action={saveModality.bind(null, modality.id)} className="student-form"><section className="form-section"><h2>Dados da modalidade</h2><div className="form-grid"><label>Nome *<input name="name" required defaultValue={modality.name} /></label><label>Unidade<p><strong>{unit.name}</strong></p></label><label className="span-2">Descrição<textarea name="description" defaultValue={modality.description ?? ''} /></label></div><p className="muted-note">A unidade não pode ser alterada após a criação, para preservar a consistência dos vínculos esportivos existentes.</p></section><section className="form-section"><h2>Situação</h2><p>Status atual: <strong>{modality.status}</strong></p><p className="muted-note">A alteração de status não está disponível enquanto os valores canônicos não estiverem formalmente definidos.</p></section>{query.updated && <p className="form-success" role="status">Modalidade atualizada com sucesso.</p>}{query.error === 'validation' && <p className="form-error" role="alert">Revise os campos informados e tente novamente.</p>}{query.error === 'update' && <p className="form-error" role="alert">Não foi possível atualizar a modalidade. Tente novamente.</p>}<div className="form-actions"><button>Salvar alterações</button></div></form></>
}
