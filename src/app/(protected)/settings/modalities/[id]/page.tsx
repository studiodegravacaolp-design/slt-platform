import { modalityDuplicateMessages } from '@/domain/modality-name'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { getModality } from '@/services/modalities'
import { getUnit } from '@/services/units'
import { changeModalityStatus, saveModality } from '../../actions'
import styles from '../modalities.module.css'

export default async function ModalityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ updated?: string; status?: string; error?: string }> }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) notFound()
  let modality
  let unit
  try { modality = await getModality(id); unit = await getUnit(modality.unit_id) } catch { notFound() }
  const query = await searchParams

  return <div className={styles.page}><PageHeader title={modality.name} description="Dados, unidade vinculada e situação da modalidade." eyebrow="SLT Free · Organização" action={<Link className={`button ${styles.backButton}`} href="/settings/modalities">← Modalidades</Link>} /><form action={saveModality.bind(null, modality.id)} className={styles.detailForm}><section className={`panel ${styles.detailCard}`}><div><h2>Dados da modalidade</h2><p className={styles.cardDescription}>Atualize as informações exibidas para esta modalidade.</p></div><div className={styles.formGrid}><label>Nome *<input name="name" required defaultValue={modality.name} /></label><label className={styles.wide}>Descrição<textarea name="description" defaultValue={modality.description ?? ''} /></label></div></section><section className={`panel ${styles.detailCard}`}><div><h2>Unidade vinculada</h2><p className={styles.cardDescription}>A unidade é definida na criação e não pode ser alterada depois.</p></div><p className={styles.unitValue}><strong>{unit.name}</strong><span>Vínculo mantido para preservar a consistência esportiva.</span></p></section>{query.updated ? <p className="form-success" role="status">Modalidade atualizada com sucesso.</p> : null}{query.error === 'validation' ? <p className="form-error" role="alert">Revise os campos informados e tente novamente.</p> : null}{query.error === 'update' ? <p className="form-error" role="alert">Não foi possível atualizar a modalidade. Tente novamente.</p> : null}{query.error === 'duplicate-active' ? <p className="form-error" role="alert">{modalityDuplicateMessages.active}</p> : null}{query.error === 'duplicate-inactive' ? <p className="form-error" role="alert">{modalityDuplicateMessages.inactive}</p> : null}<div className="form-actions"><button>Salvar alterações</button></div></form><section className={`panel ${styles.statusPanel}`}><h2>Situação</h2><p className={styles.statusSummary}><span className={`${styles.status} ${modality.status === 'active' ? styles.active : styles.inactive}`}>{modality.status === 'active' ? 'Ativa' : 'Inativa'}</span></p><p>{modality.status === 'active' ? 'A modalidade está disponível para novos vínculos esportivos.' : 'A modalidade está inativa e não deve receber novos vínculos.'}</p><form action={changeModalityStatus.bind(null, modality.id)} className={styles.statusForm}><label>Status<select name="status" defaultValue={modality.status}><option value="active">Ativa</option><option value="inactive">Inativa</option></select></label><button type="submit">Atualizar status</button></form>{query.status ? <p className="form-success" role="status">Status da modalidade atualizado com sucesso.</p> : null}{query.error === 'status' ? <p className="form-error" role="alert">Não foi possível atualizar o status da modalidade.</p> : null}</section></div>
}
