export function PageHeader({ title, description, action, eyebrow, badge }: Readonly<{ title: string; description: string; action?: React.ReactNode; eyebrow?: string; badge?: string }>) {
  return <header className={`page-header${eyebrow || badge ? ' page-header-featured' : ''}`}><div>{eyebrow ? <p className="page-header-eyebrow">{eyebrow}</p> : null}<h1>{title}</h1><p>{description}</p></div><div className="page-header-actions">{badge ? <span className="page-header-badge">{badge}</span> : null}{action}</div></header>
}
