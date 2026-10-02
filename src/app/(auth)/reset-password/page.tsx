import Link from 'next/link'
import { resetPassword } from './actions'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <main className="login"><form action={resetPassword}><p className="eyebrow">SLT Platform</p><h1>Definir nova senha</h1><label>Nova senha<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label><label>Confirmar nova senha<input name="password_confirmation" type="password" required minLength={8} autoComplete="new-password" /></label><p>Use pelo menos 8 caracteres.</p>{params.error && <p className="error" role="alert">Não foi possível redefinir a senha. Solicite um novo link e tente novamente.</p>}<button type="submit">Redefinir senha</button><Link href="/login">Voltar para o login</Link></form></main>
}
