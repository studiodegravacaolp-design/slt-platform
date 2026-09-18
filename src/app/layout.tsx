import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'SLT Platform', description: 'Gestão esportiva multiempresa.' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html> }
