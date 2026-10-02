import Link from 'next/link'

export default function UnitNotFound() {
  return <section className="panel error-state"><h1>Unidade não encontrada</h1><p>Ela pode não existir ou não pertencer à sua organização.</p><Link className="button" href="/settings/units">Voltar para unidades</Link></section>
}
