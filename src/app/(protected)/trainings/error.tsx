'use client'

export default function TrainingsError({ reset }: Readonly<{ reset: () => void }>) {
  return <section className="panel" role="alert">
    <h1>Não foi possível carregar os treinamentos</h1>
    <p>Tente novamente. Se o problema continuar, verifique sua conexão e tente mais tarde.</p>
    <button type="button" onClick={reset}>Tentar novamente</button>
  </section>
}
