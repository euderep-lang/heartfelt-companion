'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus, Search, Eye, Trash2, MoreHorizontal, FileText,
  Pencil, FileDown, MessageCircle, Copy,
} from 'lucide-react'
import { cn, formatCurrency, formatDate, formatarMensagemWhatsApp } from '@/lib/utils'
import { STATUS_CONFIG, type StatusOrcamento } from '@/types'
import { StatusBadge } from './StatusBadge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import toast from 'react-hot-toast'

interface OrcamentoItem {
  id: string
  numero: string
  titulo: string
  cliente_nome: string | null
  cliente_telefone?: string | null
  total_final: number
  status: string
  created_at: string
}

interface TabelaHistoricoProps {
  orcamentos: OrcamentoItem[]
}

type FiltroPeriodo = 'todos' | 'hoje' | 'esta_semana' | 'este_mes' | 'ultimos_3_meses'

const STATUS_OPTIONS: StatusOrcamento[] = ['gerado', 'enviado', 'em_negociacao', 'assinado', 'rejeitado', 'cancelado']

function aplicarFiltroPeriodo(createdAt: string, filtro: FiltroPeriodo): boolean {
  if (filtro === 'todos') return true
  const agora = new Date()
  const data = new Date(createdAt)
  if (filtro === 'hoje') return data.toDateString() === agora.toDateString()
  if (filtro === 'esta_semana') {
    const inicioSemana = new Date(agora)
    inicioSemana.setDate(agora.getDate() - agora.getDay())
    inicioSemana.setHours(0, 0, 0, 0)
    return data >= inicioSemana
  }
  if (filtro === 'este_mes') {
    return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear()
  }
  if (filtro === 'ultimos_3_meses') {
    const tresMesesAtras = new Date(agora)
    tresMesesAtras.setMonth(agora.getMonth() - 3)
    return data >= tresMesesAtras
  }
  return true
}

export function TabelaHistorico({ orcamentos: orcamentosIniciais }: TabelaHistoricoProps) {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState(orcamentosIniciais)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusOrcamento | 'todos'>('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('todos')

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase()
    return orcamentos
      .filter(o => filtroStatus === 'todos' || o.status === filtroStatus)
      .filter(o => aplicarFiltroPeriodo(o.created_at, filtroPeriodo))
      .filter(o =>
        !termo ||
        o.titulo.toLowerCase().includes(termo) ||
        o.numero.toLowerCase().includes(termo) ||
        (o.cliente_nome?.toLowerCase().includes(termo) ?? false)
      )
  }, [orcamentos, filtroStatus, filtroPeriodo, busca])

  async function handleExcluir(id: string, titulo: string) {
    if (!confirm(`Excluir o orçamento "${titulo}"?`)) return
    const res = await fetch(`/api/orcamentos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setOrcamentos(prev => prev.filter(o => o.id !== id))
      toast.success('Orçamento excluído')
    } else {
      toast.error('Erro ao excluir')
    }
  }

  async function handleGerarPDF(id: string) {
    toast.loading('Gerando PDF...', { id: 'pdf' })
    try {
      const res = await fetch(`/api/pdf/${id}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      window.open(URL.createObjectURL(blob), '_blank')
      toast.success('PDF gerado!', { id: 'pdf' })
    } catch {
      toast.error('Erro ao gerar PDF', { id: 'pdf' })
    }
  }

  function handleWhatsApp(orc: OrcamentoItem) {
    if (!orc.cliente_telefone) {
      toast.error('Orçamento sem telefone do cliente')
      return
    }
    const tel = orc.cliente_telefone.replace(/\D/g, '')
    const msg = formatarMensagemWhatsApp({
      numeroOrcamento: orc.numero,
      clienteNome: orc.cliente_nome ?? 'cliente',
      titulo: orc.titulo,
      dataEmissao: formatDate(orc.created_at),
      dataValidade: '—',
      servicos: [],
      totalFinal: orc.total_final,
    })
    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  async function handleDuplicar(id: string) {
    toast.loading('Duplicando...', { id: 'dup' })
    try {
      const res = await fetch(`/api/orcamentos/${id}/duplicar`, { method: 'POST' })
      if (!res.ok) throw new Error()
      const novo = await res.json()
      toast.success('Orçamento duplicado!', { id: 'dup' })
      router.push(`/construcao-civil/${novo.id}`)
    } catch {
      toast.error('Erro ao duplicar', { id: 'dup' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Orçamentos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orcamentos.length} orçamentos no total</p>
        </div>
        <Link
          href="/construcao-civil/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar orçamentos..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className={cn(
              'w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white',
              'text-slate-900 placeholder:text-slate-400',
              'focus:outline-none focus:border-[#e8500a]/50 focus:ring-1 focus:ring-[#e8500a]/20'
            )}
          />
        </div>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value as StatusOrcamento | 'todos')}
          className="px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#e8500a]/50 cursor-pointer"
        >
          <option value="todos">Todos os status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        <select
          value={filtroPeriodo}
          onChange={e => setFiltroPeriodo(e.target.value as FiltroPeriodo)}
          className="px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#e8500a]/50 cursor-pointer"
        >
          <option value="todos">Todos os períodos</option>
          <option value="hoje">Hoje</option>
          <option value="esta_semana">Esta semana</option>
          <option value="este_mes">Este mês</option>
          <option value="ultimos_3_meses">Últimos 3 meses</option>
        </select>
      </div>

      {/* Tabela */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-slate-200 bg-white">
          <FileText className="w-10 h-10 text-slate-200 mb-3" />
          <p className="text-base font-medium text-slate-800 mb-1">
            {orcamentos.length === 0 ? 'Nenhum orçamento ainda' : 'Nenhum orçamento encontrado'}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            {orcamentos.length === 0
              ? 'Crie seu primeiro orçamento com IA'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {orcamentos.length === 0 && (
            <Link
              href="/construcao-civil/novo"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar com IA
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nº</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((orc, i) => (
                <motion.tr
                  key={orc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-slate-400">{orc.numero}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/construcao-civil/${orc.id}`}
                      className="text-sm font-medium text-slate-800 hover:text-[#e8500a] transition-colors line-clamp-1"
                    >
                      {orc.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-slate-500">{orc.cliente_nome ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(orc.total_final)}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <StatusBadge status={orc.status as StatusOrcamento} />
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-xs text-slate-400">{formatDate(orc.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/construcao-civil/${orc.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => router.push(`/construcao-civil/${orc.id}?modo=editar`)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-lg">
                          <DropdownMenuItem
                            className="text-slate-700 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-sm"
                            onClick={() => handleGerarPDF(orc.id)}
                          >
                            <FileDown className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Gerar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-slate-700 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-sm"
                            onClick={() => handleWhatsApp(orc)}
                          >
                            <MessageCircle className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Enviar WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-slate-700 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-sm"
                            onClick={() => handleDuplicar(orc.id)}
                          >
                            <Copy className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-sm"
                            onClick={() => handleExcluir(orc.id, orc.titulo)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
