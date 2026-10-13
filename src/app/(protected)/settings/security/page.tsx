import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { updatePassword } from './actions'
import styles from '../settings.module.css'

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const params = await searchParams
  return <div className={styles.page}>
    <PageHeader title="Segurança" description="Altere a senha da conta autenticada." eyebrow="SLT Free · Organização" badge="SLT Free" action={<Link className="button" href="/settings">← Configurações</Link>} />
    <form action={updatePassword} className={`${styles.form} ${styles.securityForm}`}>
      <section className={styles.card}><h2>Alterar senha</h2><p className={styles.cardDescription}>Use uma senha forte e mantenha-a em segurança.</p><div className={styles.formGrid}><label>Nova senha *<input name="password" type="password" autoComplete="new-password" required minLength={8} /></label><label>Confirmar nova senha *<input name="password_confirmation" type="password" autoComplete="new-password" required minLength={8} /></label></div><p className={styles.note}>Use pelo menos 8 caracteres.</p></section>
      {params.updated ? <p className={`${styles.feedback} form-success`} role="status">Senha alterada com sucesso.</p> : null}{params.error ? <p className={`${styles.feedback} form-error`} role="alert">Não foi possível alterar a senha. Revise os dados e tente novamente.</p> : null}
      <div className={styles.formActions}><button>Alterar senha</button></div>
    </form>
  </div>
}
