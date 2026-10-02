'use client'

export default function UnitsError({ reset }: Readonly<{ reset: () => void }>) {
  return <section className="panel error-state"><h1>Não foi possível carregar as unidades</h1><p>Verifique sua conexão e tente novamente.</p><button onClick={reset}>Tentar novamente</button></section>
}
