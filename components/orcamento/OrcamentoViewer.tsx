'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Printer,
  Share2,
  Edit2,
  Copy,
  Trash2,
  ChevronDown,
  X,
  Check,
  Loader2,
  Pencil,
} from 'lucide-react'
import { cn, formatCurrency, formatDate, formatPercent, formatarMensagemWhatsApp } from '@/lib/utils'
import { STATUS_CONFIG, type Orcamento, type StatusOrcamento, type OrcamentoItem } from '@/types'
import { StatusBadge } from './StatusBadge'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OrcamentoViewerProps {
  orcamento: Orcamento
}

type Aba = 'vendas' | 'custos' | 'materiais'

export function OrcamentoViewer({ orcamento }: OrcamentoViewerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [abaAtiva, setAbaAtiva] = useState<Aba>('vendas')
  const [statusAtual, setStatusAtual] = useState<StatusOrcamento>(orcamento.status)
  const [editandoOrcamento, setEditandoOrcamento] = useState(false)
  const [itemEditando, setItemEditando] = useState<OrcamentoItem | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  // Form state for orcamento edit
  const [formOrc, setFormOrc] = useState({
    titulo: orcamento.titulo,
    cliente_nome: orcamento.cliente_nome ?? '',
    cliente_telefone: orcamento.cliente_telefone ?? '',
    condicoes_pagamento: orcamento.condicoes_pagamento ?? '',
    observacoes: orcamento.observacoes ?? '',
  })
  const [salvandoOrc, setSalvandoOrc] = useState(false)

  // Form state for item edit
  const [formItem, setFormItem] = useState({
    descricao: '',
    quantidade: '',
    unidade: '',
    preco_unitario_venda: '',
  })
  const [salvandoItem, setSalvandoItem] = useState(false)

  // Auto-open edit on ?modo=editar
  useEffect(() => {
    if (searchParams.get('modo') === 'editar') {
      setEditandoOrcamento(true)
    }
  }, [searchParams])

  const secaoVendas = orcamento.secoes?.find(s => s.tipo === 'vendas')
  const secaoCustos = orcamento.secoes?.find(s => s.tipo === 'custos')
  const secaoMateriais = orcamento.secoes?.find(s => s.tipo === 'materiais')

  const secaoAtiva = abaAtiva === 'vendas' ? secaoVendas
    : abaAtiva === 'custos' ? secaoCustos
    : secaoMateriais

  async function handleAlterarStatus(novoStatus: StatusOrcamento) {
    const res = await fetch(`/api/orcamentos/${orcamento.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    })
    if (res.ok) {
      setStatusAtual(novoStatus)
      toast.success(`Status alterado para "${STATUS_CONFIG[novoStatus].label}"`)
    } else {
      toast.error('Erro ao alterar status')
    }
  }

  async function handleGerarPDF() {
    const res = await fetch(`/api/pdf/${orcamento.id}`)
    if (!res.ok) { toast.error('Erro ao gerar PDF'); return }
    const blob = await res.blob()
    window.open(URL.createObjectURL(blob), '_blank')
  }

  function handleWhatsApp() {
    if (!orcamento.cliente_telefone) {
      toast.error('Orçamento sem telefone do cliente')
      return
    }
    const tel = orcamento.cliente_telefone.replace(/\D/g, '')
    const servicos = secaoVendas?.grupos
      ?.flatMap(g => g.itens?.map(i => i.descricao) ?? [])
      ?.slice(0, 8) ?? []
    const msg = formatarMensagemWhatsApp({
      numeroOrcamento: orcamento.numero,
      clienteNome: orcamento.cliente_nome ?? 'cliente',
      titulo: orcamento.titulo,
      dataEmissao: formatDate(orcamento.created_at),
      dataValidade: orcamento.data_validade ? formatDate(orcamento.data_validade) : `${orcamento.validade_dias} dias`,
      servicos,
      totalFinal: orcamento.total_final,
    })
    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  async function handleSalvarOrcamento() {
    setSalvandoOrc(true)
    const res = await fetch(`/api/orcamentos/${orcamento.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: formOrc.titulo,
        cliente_nome: formOrc.cliente_nome || null,
        cliente_telefone: formOrc.cliente_telefone || null,
        observacoes: formOrc.observacoes || null,
      }),
    })
    setSalvandoOrc(false)
    if (res.ok) {
      toast.success('Orçamento atualizado!')
      setEditandoOrcamento(false)
      router.refresh()
    } else {
      toast.error('Erro ao salvar')
    }
  }

  async function handleDuplicar() {
    toast.loading('Duplicando...', { id: 'dup' })
    const res = await fetch(`/api/orcamentos/${orcamento.id}/duplicar`, { method: 'POST' })
    if (res.ok) {
      const novo = await res.json()
      toast.success('Orçamento duplicado!', { id: 'dup' })
      router.push(`/construcao-civil/${novo.id}`)
    } else {
      toast.error('Erro ao duplicar', { id: 'dup' })
    }
  }

  async function handleExcluir() {
    if (!confirm(`Excluir o orçamento "${orcamento.titulo}"? Esta ação não pode ser desfeita.`)) return
    setExcluindo(true)
    const res = await fetch(`/api/orcamentos/${orcamento.id}`, { method: 'DELETE' })
    setExcluindo(false)
    if (res.ok) {
      toast.success('Orçamento excluído')
      router.push('/construcao-civil')
    } else {
      toast.error('Erro ao excluir')
    }
  }

  function abrirEditarItem(item: OrcamentoItem) {
    setFormItem({
      descricao: item.descricao,
      quantidade: String(item.quantidade),
      unidade: item.unidade ?? '',
      preco_unitario_venda: String(item.preco_unitario_venda),
    })
    setItemEditando(item)
  }

  async function handleSalvarItem() {
    if (!itemEditando) return
    setSalvandoItem(true)

    const qtd = Number(formItem.quantidade)
    const preco = Number(formItem.preco_unitario_venda)

    const res = await fetch(`/api/orcamentos/${orcamento.id}/itens/${itemEditando.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descricao: formItem.descricao,
        quantidade: qtd,
        unidade: formItem.unidade,
        preco_unitario_venda: preco,
      }),
    })
    setSalvandoItem(false)

    if (res.ok) {
      toast.success('Item salvo')
      setItemEditando(null)
      router.refresh()
    } else {
      toast.error('Erro ao salvar item')
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-4 shrink-0 flex-wrap gap-y-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-mono">{orcamento.numero}</span>
            <StatusBadge status={statusAtual} />
          </div>
          <h1 className="text-base font-semibold text-slate-900 truncate">{orcamento.titulo}</h1>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGerarPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            PDF
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Mais <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-lg">
              <DropdownMenuItem
                className="text-slate-700 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-sm"
                onClick={() => setEditandoOrcamento(true)}
              >
                <Edit2 className="w-3.5 h-3.5 mr-2 text-slate-400" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-slate-700 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-sm"
                onClick={handleDuplicar}
              >
                <Copy className="w-3.5 h-3.5 mr-2 text-slate-400" /> Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-sm"
                onClick={handleExcluir}
                disabled={excluindo}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {/* Abas */}
          <div className="px-6 pt-4 border-b border-slate-200 bg-white">
            <div className="flex gap-1">
              {([
                { id: 'vendas', label: 'Orçamento de Vendas' },
                { id: 'custos', label: 'Orçamento de Custos' },
                { id: 'materiais', label: 'Lista de Materiais' },
              ] as { id: Aba; label: string }[]).map(aba => (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative',
                    abaAtiva === aba.id
                      ? 'text-[#e8500a] bg-[#fff5f0]'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {aba.label}
                  {abaAtiva === aba.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e8500a] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dados do orçamento */}
          <div className="p-6">
            {/* Cabeçalho do orçamento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl border border-slate-200 bg-white">
              <div>
                <p className="text-xs text-slate-400">Cliente</p>
                <p className="text-sm font-medium text-slate-900">{orcamento.cliente_nome ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Data de emissão</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(orcamento.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Validade</p>
                <p className="text-sm font-medium text-slate-900">
                  {orcamento.data_validade ? formatDate(orcamento.data_validade) : `${orcamento.validade_dias} dias`}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Telefone</p>
                <p className="text-sm font-medium text-slate-900">{orcamento.cliente_telefone ?? '—'}</p>
              </div>
            </div>

            {/* Grupos e itens */}
            {secaoAtiva ? (
              <div className="space-y-4">
                {(secaoAtiva.grupos ?? []).map(grupo => (
                  <motion.div
                    key={grupo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-sm font-semibold text-slate-800">{grupo.nome}</h3>
                      <span className="text-sm font-semibold text-[#e8500a]">
                        {formatCurrency(grupo.subtotal ?? 0)}
                      </span>
                    </div>

                    <table className="w-full">
                      <thead>
                        <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="px-4 py-2 text-left">Descrição</th>
                          <th className="px-4 py-2 text-center">Qtd</th>
                          <th className="px-4 py-2 text-center">Un</th>
                          <th className="px-4 py-2 text-right">Preço Unit.</th>
                          <th className="px-4 py-2 text-right">Total</th>
                          {abaAtiva === 'vendas' && <th className="px-4 py-2 w-8" />}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(grupo.itens ?? []).map(item => {
                          const precoUnit = abaAtiva === 'custos'
                            ? item.preco_unitario_custo
                            : item.preco_unitario_venda
                          const total = abaAtiva === 'custos' ? item.total_custo : item.total_venda

                          return (
                            <tr
                              key={item.id}
                              className={cn(
                                'hover:bg-slate-50 transition-colors',
                                abaAtiva === 'vendas' && 'cursor-pointer group'
                              )}
                              onClick={abaAtiva === 'vendas' ? () => abrirEditarItem(item) : undefined}
                              title={abaAtiva === 'vendas' ? 'Clique para editar' : undefined}
                            >
                              <td className="px-4 py-2.5 text-sm text-slate-800">{item.descricao}</td>
                              <td className="px-4 py-2.5 text-sm text-slate-500 text-center">{item.quantidade}</td>
                              <td className="px-4 py-2.5 text-sm text-slate-500 text-center">{item.unidade ?? '—'}</td>
                              <td className="px-4 py-2.5 text-sm text-slate-500 text-right">{formatCurrency(precoUnit ?? 0)}</td>
                              <td className="px-4 py-2.5 text-sm font-medium text-slate-900 text-right">{formatCurrency(total ?? 0)}</td>
                              {abaAtiva === 'vendas' && (
                                <td className="px-4 py-2.5 text-right">
                                  <Pencil className="w-3 h-3 text-slate-300 group-hover:text-slate-400" />
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </motion.div>
                ))}

                {/* Total */}
                <div className="flex justify-end">
                  <div className="rounded-xl border border-[#ffc4a0] bg-[#fff5f0] px-6 py-4 text-right">
                    <p className="text-xs text-slate-500 mb-1">Total</p>
                    <p className="text-2xl font-bold text-[#e8500a]">
                      {formatCurrency(secaoAtiva.subtotal ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-slate-400">Seção sem dados</p>
              </div>
            )}
          </div>
        </div>

        {/* Painel lateral */}
        <div className="w-64 border-l border-slate-200 bg-white p-4 space-y-4 overflow-y-auto shrink-0 hidden lg:block">
          {/* Resumo financeiro */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Resumo</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Total Custo</span>
                <span className="text-xs font-medium text-slate-800">{formatCurrency(orcamento.total_custo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Total Venda</span>
                <span className="text-xs font-medium text-[#e8500a]">{formatCurrency(orcamento.total_venda)}</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Margem</span>
                <span className="text-xs font-bold text-[#e8500a]">{formatPercent(orcamento.margem_total)}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Status</p>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm transition-colors hover:bg-slate-50">
                <StatusBadge status={statusAtual} />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-slate-200 shadow-lg w-48">
                {(Object.keys(STATUS_CONFIG) as StatusOrcamento[]).map(s => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => handleAlterarStatus(s)}
                    className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                  >
                    <StatusBadge status={s} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Cliente */}
          {orcamento.cliente_nome && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cliente</p>
              <p className="text-xs text-slate-800">{orcamento.cliente_nome}</p>
              {orcamento.cliente_telefone && (
                <p className="text-xs text-slate-500 mt-0.5">{orcamento.cliente_telefone}</p>
              )}
            </div>
          )}

          {/* Histórico */}
          {orcamento.historico && orcamento.historico.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Histórico</p>
              <div className="space-y-2">
                {orcamento.historico.slice(-5).reverse().map(h => (
                  <div key={h.id} className="text-xs">
                    <p className="text-slate-800">{STATUS_CONFIG[h.status_novo as StatusOrcamento]?.label ?? h.status_novo}</p>
                    <p className="text-slate-400">{formatDate(h.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumo IA */}
          {orcamento.resumo_ia && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Resumo IA</p>
              <p className="text-xs text-slate-500 leading-relaxed">{orcamento.resumo_ia}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal editar orçamento */}
      <Dialog open={editandoOrcamento} onOpenChange={v => !v && setEditandoOrcamento(false)}>
        <DialogContent className="bg-white border border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">Editar Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Título</label>
              <input
                value={formOrc.titulo}
                onChange={e => setFormOrc(p => ({ ...p, titulo: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Cliente</label>
                <input
                  value={formOrc.cliente_nome}
                  onChange={e => setFormOrc(p => ({ ...p, cliente_nome: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Telefone</label>
                <input
                  value={formOrc.cliente_telefone}
                  onChange={e => setFormOrc(p => ({ ...p, cliente_telefone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Observações</label>
              <textarea
                value={formOrc.observacoes}
                onChange={e => setFormOrc(p => ({ ...p, observacoes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditandoOrcamento(false)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvarOrcamento}
              disabled={salvandoOrc}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {salvandoOrc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal editar item */}
      <Dialog open={!!itemEditando} onOpenChange={v => !v && setItemEditando(null)}>
        <DialogContent className="bg-white border border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">Editar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Descrição</label>
              <input
                value={formItem.descricao}
                onChange={e => setFormItem(p => ({ ...p, descricao: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Qtd</label>
                <input
                  type="number"
                  step="0.01"
                  value={formItem.quantidade}
                  onChange={e => setFormItem(p => ({ ...p, quantidade: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Unid.</label>
                <input
                  value={formItem.unidade}
                  onChange={e => setFormItem(p => ({ ...p, unidade: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Preço Unit.</label>
                <input
                  type="number"
                  step="0.01"
                  value={formItem.preco_unitario_venda}
                  onChange={e => setFormItem(p => ({ ...p, preco_unitario_venda: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20"
                />
              </div>
            </div>
            <div className="text-xs text-slate-400 text-right">
              Total: {formatCurrency(Number(formItem.quantidade) * Number(formItem.preco_unitario_venda))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setItemEditando(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvarItem}
              disabled={salvandoItem}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {salvandoItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
