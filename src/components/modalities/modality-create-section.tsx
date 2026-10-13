'use client'

import { useState, type ReactNode } from 'react'
import styles from './modality-create-section.module.css'

/**
 * Keeps the creation form out of the initial scan of the page without
 * changing the Server Action or the form's duplicate-submit safeguard.
 */
export function ModalityCreateSection({ children }: Readonly<{ children: ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false)

  return <section className={styles.section} aria-labelledby="modality-create-heading"><div className={styles.heading}><div><h2 id="modality-create-heading">Modalidades cadastradas</h2><p>Organize as modalidades esportivas de cada unidade.</p></div><button type="button" aria-expanded={isOpen} aria-controls="modality-create-form" onClick={() => setIsOpen((open) => !open)}>{isOpen ? 'Fechar cadastro' : '+ Nova modalidade'}</button></div>{isOpen ? <div id="modality-create-form" className={styles.form}>{children}</div> : null}</section>
}
