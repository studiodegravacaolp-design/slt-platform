import Link from 'next/link'
import { updatePassword } from './actions'

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const params = await searchParams
  return <><Link href="/settings">← Configurações</Link><h1>Segurança</h1><form action={updatePassword} className="student-form"><section className="form-section"><h2>Alterar senha</h2><div className="form-grid"><label>Nova senha *<input name="password" type="password" autoComplete="new-password" required minLength={8}/></label><label>Confirmar nova senha *<input name="password_confirmation" type="password" autoComplete="new-password" required minLength={8}/></label></div><p className="muted-note">Use pelo menos 8 caracteres.</p></section>{params.updated && <p className="form-success" role="status">Senha alterada com sucesso.</p>}{params.error && <p className="form-error" role="alert">Não foi possível alterar a senha. Revise os dados e tente novamente.</p>}<div className="form-actions"><button>Alterar senha</button></div></form></>
}
