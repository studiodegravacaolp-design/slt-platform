import Link from 'next/link'
import { requestPasswordRecovery } from './actions'

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams
  return <main className="login"><form action={requestPasswordRecovery}><p className="eyebrow">SLT Platform</p><h1>Recuperar senha</h1><p>Informe o e-mail utilizado no SLT.</p><label>E-mail<input name="email" type="email" required autoComplete="email" /></label>{params.sent && <p className="form-success" role="status">Se existir uma conta associada a este e-mail, enviaremos as instruções de recuperação.</p>}{params.error === 'validation' && <p className="error" role="alert">Informe um e-mail válido e tente novamente.</p>}{params.error && params.error !== 'validation' && <p className="error" role="alert">Não foi possível iniciar a recuperação. Tente novamente.</p>}<button type="submit">Enviar link de recuperação</button><Link href="/login">Voltar para o login</Link></form></main>
}
