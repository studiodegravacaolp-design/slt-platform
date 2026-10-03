import Link from 'next/link'

export const currentSltPlan = 'Free'

export default function PlanPage() {
  return <>
    <Link href="/settings">← Configurações</Link>
    <h1>Plano</h1>
    <section className="panel">
      <h2>Plano atual</h2>
      <p><strong>{currentSltPlan}</strong></p>
      <p>Você está utilizando o Plano Free do SLT.</p>
    </section>
  </>
}
