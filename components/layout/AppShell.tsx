'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAppStore } from '@/store/useAppStore'
import type { Perfil, Empresa } from '@/types'

interface AppShellProps {
  children: React.ReactNode
  perfil: Perfil | null
  empresa: Empresa | null
}

export function AppShell({ children, perfil, empresa }: AppShellProps) {
  const { setPerfil, setEmpresa, sidebarColapsada } = useAppStore()

  useEffect(() => {
    setPerfil(perfil)
    setEmpresa(empresa)
  }, [perfil, empresa, setPerfil, setEmpresa])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <motion.main
        animate={{ marginLeft: sidebarColapsada ? 64 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen overflow-hidden"
      >
        <Header />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
