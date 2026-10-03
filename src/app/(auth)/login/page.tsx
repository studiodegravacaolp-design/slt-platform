import { signIn } from './actions'
import Link from 'next/link'

export const loginLinks = { forgotPassword: '/forgot-password', signup: '/signup' } as const

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; password_reset?: string }> }) {
  const params = await searchParams
  return <main className="login"><form action={signIn}><p className="eyebrow">SLT Platform</p><h1>Acesse sua organização</h1><label>E-mail<input name="email" type="email" required autoComplete="email" /></label><label>Senha<input name="password" type="password" required autoComplete="current-password" /></label>{params.error && <p className="error" role="alert">Não foi possível autenticar. Verifique suas credenciais.</p>}{params.password_reset && <p className="form-success" role="status">Senha redefinida. Entre com a nova senha.</p>}<Link href={loginLinks.forgotPassword}>Esqueci minha senha</Link><Link href={loginLinks.signup}>Criar conta</Link><button type="submit">Entrar</button></form></main>
}
