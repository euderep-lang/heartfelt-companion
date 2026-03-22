'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, ChevronRight, Settings, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  'construcao-civil': 'Construção Civil',
  novo: 'Novo Orçamento',
  'banco-de-dados': 'Banco de Dados',
  configuracoes: 'Configurações',
  plano: 'Plano & Billing',
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { perfil, empresa } = useAppStore()
  const [busca, setBusca] = useState('')

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((seg, i) => ({
    label: BREADCRUMB_MAP[seg] ?? seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
            <span
              className={cn(
                'text-sm truncate',
                crumb.isLast
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-400 hover:text-slate-600 cursor-pointer transition-colors'
              )}
              onClick={() => !crumb.isLast && router.push(crumb.href)}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Busca */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar orçamentos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={cn(
            'pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50',
            'text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:border-[#e8500a]/50 focus:ring-1 focus:ring-[#e8500a]/20 focus:bg-white',
            'w-48 focus:w-64 transition-all duration-200'
          )}
        />
      </div>

      {/* Notificações */}
      <button className="relative w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#e8500a] rounded-full" />
      </button>

      {/* Avatar do usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#e8500a] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {perfil?.nome?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-slate-800 leading-tight">
              {perfil?.nome ?? 'Usuário'}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {empresa?.nome ?? 'Empresa'}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-lg">
          <DropdownMenuLabel className="text-slate-500 text-xs">Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100" />
          <DropdownMenuItem
            className="text-slate-700 cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
            onClick={() => router.push('/configuracoes')}
          >
            <User className="w-4 h-4 mr-2 text-slate-400" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-slate-700 cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
            onClick={() => router.push('/configuracoes')}
          >
            <Settings className="w-4 h-4 mr-2 text-slate-400" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-100" />
          <DropdownMenuItem
            className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
