export default function HomeLoading() {
  return <><header className="page-header"><div><h1>Home</h1><p>Carregando visão geral...</p></div></header><section className="home-section"><h2>Estrutura</h2><div className="metrics">{['Alunos', 'Unidades', 'Modalidades'].map((label) => <article key={label}><span>{label}</span><strong>—</strong></article>)}</div></section><section className="home-section"><h2>Operação</h2><div className="metrics">{['Presenças hoje', 'Avaliações', 'Cobranças'].map((label) => <article key={label}><span>{label}</span><strong>—</strong></article>)}</div></section></>
}
