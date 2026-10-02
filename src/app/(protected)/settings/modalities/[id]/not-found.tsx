import Link from 'next/link'

export default function ModalityNotFound() {
  return <section className="panel empty-state"><h1>Modalidade não encontrada</h1><p>Ela pode não existir ou não estar disponível para sua organização.</p><Link href="/settings/modalities">Voltar para modalidades</Link></section>
}
