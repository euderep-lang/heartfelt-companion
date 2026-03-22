import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ObraQ — Orçamentos de Construção Civil com IA',
    template: '%s | ObraQ',
  },
  description:
    'Gere orçamentos profissionais de construção civil em minutos com Inteligência Artificial. Papel timbrado, PDF, WhatsApp e muito mais.',
  keywords: [
    'orçamento construção civil',
    'software orçamento obra',
    'IA construção',
    'orçamento automático',
    'SaaS construção civil',
  ],
  authors: [{ name: 'ObraQ' }],
  creator: 'ObraQ',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'ObraQ',
    title: 'ObraQ — Orçamentos de Construção Civil com IA',
    description:
      'Gere orçamentos profissionais de construção civil em minutos com Inteligência Artificial.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ObraQ — Orçamentos de Construção Civil com IA',
    description:
      'Gere orçamentos profissionais de construção civil em minutos com Inteligência Artificial.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
            },
            success: {
              iconTheme: { primary: '#e8500a', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
            },
          }}
        />
      </body>
    </html>
  )
}
