'use client'

export default function NewTrainingError({ reset }: Readonly<{ reset: () => void }>) {
  return <section className="panel" role="alert">
    <h1>Não foi possível criar o treinamento</h1>
    <p>Revise os dados e tente novamente.</p>
    <button type="button" onClick={reset}>Tentar novamente</button>
  </section>
}
