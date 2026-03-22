'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HardHat, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200'
          : 'bg-white border-b border-slate-200'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#e8500a] flex items-center justify-center shadow-[0_0_20px_rgba(232,80,10,0.3)]">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">ObraQ</span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#funcionalidades" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Funcionalidades
          </a>
          <a href="#precos" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Preços
          </a>
          <a href="#depoimentos" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Depoimentos
          </a>
        </div>

        {/* CTAs desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className={cn(
              'text-sm font-semibold px-4 py-2 rounded-lg transition-all',
              'bg-[#e8500a] hover:bg-[#c94208] text-white',
              'shadow-[0_0_20px_rgba(232,80,10,0.3)] hover:shadow-[0_0_30px_rgba(232,80,10,0.4)]'
            )}
          >
            Começar grátis
          </Link>
        </div>

        {/* Menu mobile */}
        <button
          className="md:hidden text-slate-600 hover:text-slate-900"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu mobile expandido */}
      {menuAberto && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3"
        >
          <a href="#funcionalidades" className="block text-sm text-slate-600 hover:text-slate-900 py-2">
            Funcionalidades
          </a>
          <a href="#precos" className="block text-sm text-slate-600 hover:text-slate-900 py-2">
            Preços
          </a>
          <a href="#depoimentos" className="block text-sm text-slate-600 hover:text-slate-900 py-2">
            Depoimentos
          </a>
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center text-sm text-slate-600 border border-slate-200 py-2.5 rounded-lg">
              Entrar
            </Link>
            <Link href="/cadastro" className="flex-1 text-center text-sm font-semibold bg-[#e8500a] text-white py-2.5 rounded-lg">
              Começar grátis
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
