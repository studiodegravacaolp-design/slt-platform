'use client'

export default function FinancialError({ reset }: Readonly<{ reset: () => void }>) {
  return <section className="error-state" role="alert"><h2>Não foi possível carregar o Financeiro</h2><p>Verifique sua conexão e tente novamente.</p><button type="button" onClick={reset}>Tentar novamente</button></section>
}
