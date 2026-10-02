'use client'

export default function HomeError({ reset }: Readonly<{ reset: () => void }>) {
  return <section className="panel error-state"><h1>Não foi possível carregar a Home</h1><p>Verifique sua conexão e tente novamente.</p><button onClick={reset}>Tentar novamente</button></section>
}
