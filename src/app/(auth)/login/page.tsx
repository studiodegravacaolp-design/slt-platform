import { signIn } from './actions'
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <main className="login"><form action={signIn}><p className="eyebrow">SLT Platform</p><h1>Acesse sua organização</h1><label>E-mail<input name="email" type="email" required autoComplete="email" /></label><label>Senha<input name="password" type="password" required autoComplete="current-password" /></label>{params.error && <p className="error">Não foi possível autenticar. Verifique suas credenciais.</p>}<button type="submit">Entrar</button></form></main>
}
