import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { getCurrentOrganization } from '@/services/organizations'
import { getCurrentUserContext } from '@/services/users'
import { saveProfile } from './actions'
import styles from '../settings.module.css'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const [profile, organization, params] = await Promise.all([getCurrentUserContext(), getCurrentOrganization(), searchParams])
  return <div className={styles.page}>
    <PageHeader title="Meu perfil" description="Dados do profissional autenticado." eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href="/settings">← Configurações</Link>} />
    <form action={saveProfile} className={styles.form}>
      <section className={styles.card}><h2>Dados pessoais</h2><p className={styles.cardDescription}>Mantenha suas informações de contato atualizadas.</p><div className={styles.formGrid}><label>Nome *<input name="name" required defaultValue={profile.name} /></label><label>Telefone<input name="phone" type="tel" defaultValue={profile.phone ?? ''} /></label></div>{profile.avatar ? <p className={styles.note}>Avatar cadastrado. A alteração de avatar não está disponível nesta versão.</p> : null}</section>
      <section className={styles.card}><h2>Informações da conta</h2><p className={styles.cardDescription}>Campos vinculados à sua conta e organização atual.</p><dl className={styles.accountGrid}><div><dt>E-mail</dt><dd>{profile.email}</dd></div><div><dt>Organização</dt><dd>{organization.name}</dd></div><div><dt>Situação</dt><dd>{profile.status}</dd></div></dl></section>
      {params.updated ? <p className={`${styles.feedback} form-success`} role="status">Perfil atualizado com sucesso.</p> : null}{params.error ? <p className={`${styles.feedback} form-error`} role="alert">Não foi possível salvar o perfil. Revise os dados e tente novamente.</p> : null}
      <div className={styles.formActions}><button>Salvar alterações</button></div>
    </form>
  </div>
}
