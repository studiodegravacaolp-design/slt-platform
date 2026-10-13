import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { getCurrentOrganization } from '@/services/organizations'
import { saveOrganization } from '../actions'
import styles from '../settings.module.css'

export default async function OrganizationPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const [organization, params] = await Promise.all([getCurrentOrganization(), searchParams])
  return <div className={styles.page}>
    <PageHeader title="Organização" description="Dados cadastrais da organização atual." eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href="/settings">← Configurações</Link>} />
    <form action={saveOrganization} className={styles.form}>
      <section className={styles.card}><h2>Dados institucionais</h2><p className={styles.cardDescription}>Informações que identificam sua organização no SLT.</p><div className={styles.formGrid}><label className={styles.wide}>Nome *<input name="name" required defaultValue={organization.name} /></label><label>Nome fantasia<input name="trade_name" defaultValue={organization.trade_name ?? ''} /></label><label>CNPJ<input name="cnpj" defaultValue={organization.cnpj ?? ''} /></label></div>{organization.logo ? <p className={styles.note}>Logo cadastrada. A edição de logo não está disponível nesta versão.</p> : null}</section>
      <section className={styles.card}><h2>Contato</h2><p className={styles.cardDescription}>Canais de comunicação da organização.</p><div className={styles.formGrid}><label>E-mail<input name="email" type="email" defaultValue={organization.email ?? ''} /></label><label>Telefone<input name="phone" type="tel" defaultValue={organization.phone ?? ''} /></label><label className={styles.wide}>Site<input name="website" type="url" defaultValue={organization.website ?? ''} /></label></div></section>
      <section className={styles.card}><h2>Endereço</h2><p className={styles.cardDescription}>Localização e referência da organização.</p><div className={styles.formGrid}><label>CEP<input name="cep" defaultValue={organization.cep ?? ''} /></label><label>Estado<input name="state" defaultValue={organization.state ?? ''} /></label><label>Cidade<input name="city" defaultValue={organization.city ?? ''} /></label><label>Bairro<input name="neighborhood" defaultValue={organization.neighborhood ?? ''} /></label><label>Rua<input name="street" defaultValue={organization.street ?? ''} /></label><label>Número<input name="number" defaultValue={organization.number ?? ''} /></label><label className={styles.wide}>Complemento<input name="complement" defaultValue={organization.complement ?? ''} /></label></div></section>
      <section className={`${styles.card} ${styles.statusCard}`}><h2>Situação</h2><span className={styles.statusValue}>{organization.status}</span><p>A alteração de situação não está disponível nesta versão.</p></section>
      {params.updated ? <p className={`${styles.feedback} form-success`} role="status">Organização atualizada com sucesso.</p> : null}{params.error === 'validation' ? <p className={`${styles.feedback} form-error`} role="alert">Revise os campos informados e tente novamente.</p> : null}{params.error === 'update' ? <p className={`${styles.feedback} form-error`} role="alert">Não foi possível atualizar a organização. Tente novamente.</p> : null}
      <div className={styles.formActions}><button>Salvar alterações</button></div>
    </form>
  </div>
}
