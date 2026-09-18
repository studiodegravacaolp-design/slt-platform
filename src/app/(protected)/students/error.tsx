'use client'
export default function StudentsError({ reset }: Readonly<{ reset: () => void }>) { return <section className="panel error-state"><h2>Não foi possível carregar os alunos</h2><p>Verifique sua conexão e tente novamente.</p><button onClick={reset}>Tentar novamente</button></section> }
