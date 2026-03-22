'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Settings, CreditCard, LogOut,
  ChevronLeft, ChevronRight, HardHat, User, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/lib/supabase/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MODULOS } from '@/lib/modulos'
import { useState, useEffect } from 'react'

const bottomItems = [
  { href: '/configuracoes', label: 'Configurações', Icon: Settings },
  { href: '/configuracoes/plano', label: 'Plano & Billing', Icon: CreditCard },
]

const STORAGE_KEY = 'obraq_modulos_abertos'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarColapsada, toggleSidebar, perfil, empresa } = useAppStore()

  const [modulosAbertos, setModulosAbertos] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY)
      if (salvo) {
        setModulosAbertos(JSON.parse(salvo))
      } else {
        setModulosAbertos({ 'construcao-civil': true })
      }
    } catch {
      setModulosAbertos({ 'construcao-civil': true })
    }
  }, [])

  function toggleModulo(id: string) {
    setModulosAbertos(prev => {
      const next = { ...prev, [id]: !prev[id] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  function BottomLink({ item }: { item: typeof bottomItems[0] }) {
    const active = isActive(item.href)
    const link = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative',
          active
            ? 'bg-white/20 text-white font-medium'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
          sidebarColapsada && 'justify-center px-2'
        )}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded-r-full" />}
        <item.Icon className="w-4 h-4 shrink-0" />
        {!sidebarColapsada && <span className="text-sm truncate">{item.label}</span>}
      </Link>
    )
    if (sidebarColapsada) {
      return (
        <TooltipProvider delay={0}>
          <Tooltip>
            <TooltipTrigger className="w-full">{link}</TooltipTrigger>
            <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    return link
  }

  return (
    <motion.aside
      animate={{ width: sidebarColapsada ? 64 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-[#1a2b3c] flex flex-col z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 shrink-0 border-b border-white/10',
        sidebarColapsada ? 'justify-center' : 'justify-between'
      )}>
        {!sidebarColapsada && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">ObraQ</span>
          </Link>
        )}
        {sidebarColapsada && (
          <Link href="/dashboard">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
          </Link>
        )}
        {!sidebarColapsada && (
          <button
            onClick={toggleSidebar}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors text-white/50 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">

        {/* Dashboard */}
        {(() => {
          const active = isActive('/dashboard')
          const link = (
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative',
                active
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
                sidebarColapsada && 'justify-center px-2'
              )}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded-r-full" />}
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!sidebarColapsada && <span className="text-sm truncate">Dashboard</span>}
            </Link>
          )
          if (sidebarColapsada) {
            return (
              <TooltipProvider delay={0}>
                <Tooltip>
                  <TooltipTrigger className="w-full">{link}</TooltipTrigger>
                  <TooltipContent side="right"><p>Dashboard</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }
          return link
        })()}

        {/* Módulos */}
        {!sidebarColapsada && (
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-3 pt-4 pb-1">
            Módulos
          </p>
        )}
        {sidebarColapsada && <div className="border-t border-white/10 mx-1 my-2" />}

        {MODULOS.map(modulo => {
          const aberto = modulosAbertos[modulo.id] ?? false
          const moduloAtivo = isActive('/' + modulo.id) || modulo.submenus.some(s => isActive(s.href))

          if (sidebarColapsada) {
            return (
              <TooltipProvider key={modulo.id} delay={0}>
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    <button
                      onClick={() => modulo.ativo ? toggleModulo(modulo.id) : undefined}
                      className={cn(
                        'w-full flex justify-center py-2 rounded-lg transition-colors',
                        moduloAtivo ? 'text-white' : 'text-white/50 hover:text-white',
                        !modulo.ativo && 'opacity-40 cursor-default'
                      )}
                    >
                      <span className="text-base">{modulo.emoji}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{modulo.nome}{!modulo.ativo ? ' — Em breve' : ''}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }

          return (
            <div key={modulo.id}>
              <button
                onClick={() => { if (modulo.ativo) toggleModulo(modulo.id) }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left',
                  modulo.ativo ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default opacity-50',
                  moduloAtivo && modulo.ativo ? 'text-white' : 'text-white/70'
                )}
              >
                <span className="text-sm">{modulo.emoji}</span>
                <span className="text-xs font-bold uppercase tracking-wider flex-1 truncate">
                  {modulo.nome}
                </span>
                {modulo.ativo ? (
                  <ChevronDown
                    className={cn('w-3.5 h-3.5 transition-transform shrink-0', aberto && 'rotate-180')}
                  />
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/40 font-medium shrink-0">
                    em breve
                  </span>
                )}
              </button>

              <AnimatePresence initial={false}>
                {modulo.ativo && aberto && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pl-3 space-y-0.5 py-0.5">
                      {modulo.submenus.map(sub => {
                        const subActive = isActive(sub.href)
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-sm group relative',
                              subActive
                                ? 'text-white bg-white/20 font-medium'
                                : 'text-white/65 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            {subActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white rounded-r-full" />}
                            <sub.Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate flex-1">{sub.label}</span>
                            {sub.destaque && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white font-semibold">
                                IA
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-3 px-2 space-y-0.5">
        {bottomItems.map(item => (
          <BottomLink key={item.href} item={item} />
        ))}

        {sidebarColapsada && (
          <button
            onClick={toggleSidebar}
            className="w-full flex justify-center py-2 text-white/50 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Usuário */}
        <div className={cn('flex items-center gap-3 px-3 py-2 rounded-lg mt-1', sidebarColapsada && 'justify-center px-2')}>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {perfil?.avatar_url
              ? <img src={perfil.avatar_url} alt="" className="w-full h-full object-cover" />
              : <User className="w-3.5 h-3.5 text-white" />
            }
          </div>
          {!sidebarColapsada && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{perfil?.nome ?? 'Usuário'}</p>
              <p className="text-[10px] text-white/50 truncate">{empresa?.nome ?? 'Empresa'}</p>
            </div>
          )}
          <button onClick={handleLogout} className="text-white/40 hover:text-red-300 transition-colors shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
