'use client'

import { useState, type ReactNode } from 'react'
import styles from './unit-create-section.module.css'

type UnitCreateAction = (formData: FormData) => void | Promise<void>

export function UnitCreateSection({ action, children }: Readonly<{ action: UnitCreateAction; children: ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false)

  return <section className={styles.section} aria-labelledby="unit-create-heading"><div className={styles.heading}><div><h2 id="unit-create-heading">Unidades cadastradas</h2><p>Gerencie as unidades vinculadas à sua organização.</p></div><button type="button" aria-expanded={isOpen} aria-controls="unit-create-form" onClick={() => setIsOpen((open) => !open)}>{isOpen ? 'Fechar cadastro' : '+ Nova unidade'}</button></div>{isOpen ? <form id="unit-create-form" action={action} className={styles.form}><section className={styles.card}><h2>Nova unidade</h2>{children}<p className="muted-note">Novas unidades são criadas ativas. O status pode ser alterado no detalhe.</p><div className="form-actions"><button type="submit">Criar unidade</button><button type="button" className={styles.secondaryButton} onClick={() => setIsOpen(false)}>Cancelar</button></div></section></form> : null}</section>
}
