'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Database, Upload, Download, Settings2, Check } from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TIPO_ITEM_LABEL, type ItemBanco, type CategoriaItem, type TipoItem } from '@/types'
import toast from 'react-hot-toast'
import { ModalNovoItem } from './ModalNovoItem'
import { ModalImportar } from './ModalImportar'
import { ModalCategorias } from './ModalCategorias'
import * as XLSX from 'xlsx'

interface TabelaPrecosProps {
  itens: ItemBanco[]
  categorias: CategoriaItem[]
}

interface CelulaEditando {
  id: string
  campo: 'nome' | 'unidade' | 'preco_custo' | 'preco_venda'
}

export function TabelaPrecos({ itens: itensIniciais, categorias: categoriasIniciais }: TabelaPrecosProps) {
  const [itens, setItens] = useState(itensIniciais)
  const [categorias, setCategorias] = useState(categoriasIniciais)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoItem | 'todos'>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [modalImportarAberto, setModalImportarAberto] = useState(false)
  const [modalCategoriasAberto, setModalCategoriasAberto] = useState(false)
  const [editando, setEditando] = useState<ItemBanco | null>(null)
  const [celulaEditando, setCelulaEditando] = useState<CelulaEditando | null>(null)
  const [valorEditando, setValorEditando] = useState<string>('')
  const [salvandoInline, setSalvandoInline] = useState<string | null>(null)
  const inputInlineRef = useRef<HTMLInputElement>(null)

  const filtrados = itens.filter(item => {
    const matchBusca = !busca || item.nome.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || item.tipo === filtroTipo
    const matchCategoria = filtroCategoria === 'todas' || item.categoria_id === filtroCategoria
    return matchBusca && matchTipo && matchCategoria
  })

  function handleSalvo(item: ItemBanco) {
    setItens(prev => {
      const existe = prev.find(i => i.id === item.id)
      return existe ? prev.map(i => i.id === item.id ? item : i) : [item, ...prev]
    })
  }

  async function handleExcluir(id: string) {
    if (!confirm('Excluir este item?')) return
    const res = await fetch(`/api/banco-de-dados/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItens(prev => prev.filter(i => i.id !== id))
      toast.success('Item excluído')
    } else {
      toast.error('Erro ao excluir')
    }
  }

  function iniciarEdicaoInline(item: ItemBanco, campo: CelulaEditando['campo']) {
    setCelulaEditando({ id: item.id, campo })
    const val = campo === 'nome' ? item.nome
      : campo === 'unidade' ? item.unidade
      : campo === 'preco_custo' ? String(item.preco_custo)
      : String(item.preco_venda)
    setValorEditando(val)
    setTimeout(() => inputInlineRef.current?.focus(), 50)
  }

  async function salvarEdicaoInline(item: ItemBanco) {
    if (!celulaEditando) return
    const { campo } = celulaEditando

    const updates: Record<string, string | number> = {}
    if (campo === 'preco_custo' || campo === 'preco_venda') {
      updates[campo] = parseFloat(valorEditando.replace(',', '.')) || 0
    } else {
      updates[campo] = valorEditando
    }

    setSalvandoInline(item.id)
    const res = await fetch(`/api/banco-de-dados/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (res.ok) {
      const atualizado = await res.json()
      setItens(prev => prev.map(i => i.id === item.id ? atualizado : i))
    } else {
      toast.error('Erro ao salvar')
    }

    setSalvandoInline(null)
    setCelulaEditando(null)
  }

  function cancelarEdicaoInline() {
    setCelulaEditando(null)
    setValorEditando('')
  }

  function exportarExcel() {
    const dados = filtrados.map(i => ({
      Código: i.codigo ?? '',
      Nome: i.nome,
      Tipo: TIPO_ITEM_LABEL[i.tipo],
      Unidade: i.unidade,
      'Preço de Custo': i.preco_custo,
      'Preço de Venda': i.preco_venda,
      'Margem %': i.margem_percentual.toFixed(1),
      Categoria: i.categoria?.nome ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(dados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Banco de Dados')
    XLSX.writeFile(wb, 'banco-de-precos.xlsx')
    toast.success('Exportado com sucesso!')
  }

  function CelulaEditavel({ item, campo, value, align = 'left' }: {
    item: ItemBanco
    campo: CelulaEditando['campo']
    value: string
    align?: 'left' | 'right' | 'center'
  }) {
    const estaEditando = celulaEditando?.id === item.id && celulaEditando?.campo === campo
    const salvando = salvandoInline === item.id

    if (estaEditando) {
      return (
        <input
          ref={inputInlineRef}
          value={valorEditando}
          onChange={e => setValorEditando(e.target.value)}
          onBlur={() => salvarEdicaoInline(item)}
          onKeyDown={e => {
            if (e.key === 'Enter') salvarEdicaoInline(item)
            if (e.key === 'Escape') cancelarEdicaoInline()
          }}
          className={cn(
            'w-full px-2 py-1 rounded border border-[#f0733a] bg-white text-sm text-slate-900 outline-none focus:ring-1 focus:ring-[#e8500a]/20',
            align === 'right' && 'text-right',
            align === 'center' && 'text-center'
          )}
        />
      )
    }

    return (
      <button
        onClick={() => iniciarEdicaoInline(item, campo)}
        className={cn(
          'w-full text-sm text-left px-1 py-0.5 rounded hover:bg-slate-100 transition-colors group relative',
          align === 'right' && 'text-right',
          align === 'center' && 'text-center'
        )}
        title="Clique para editar"
      >
        {salvando ? (
          <AnimatePresence>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-[#e8500a]" />
            </motion.span>
          </AnimatePresence>
        ) : (
          <span className="group-hover:underline decoration-dotted decoration-slate-400">{value}</span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banco de Dados</h1>
          <p className="text-sm text-slate-500 mt-0.5">{itens.length} itens cadastrados</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setModalCategoriasAberto(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Categorias
          </button>
          <button
            onClick={() => setModalImportarAberto(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Importar
          </button>
          <button
            onClick={exportarExcel}
            disabled={filtrados.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
          <button
            onClick={() => { setEditando(null); setModalNovoAberto(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar item..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e8500a]/50 focus:ring-1 focus:ring-[#e8500a]/20"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value as TipoItem | 'todos')}
          className="px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none cursor-pointer"
        >
          <option value="todos">Todos os tipos</option>
          {(Object.keys(TIPO_ITEM_LABEL) as TipoItem[]).map(t => (
            <option key={t} value={t}>{TIPO_ITEM_LABEL[t]}</option>
          ))}
        </select>
        {categorias.length > 0 && (
          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        )}
      </div>

      {filtrados.length > 0 && (
        <p className="text-[10px] text-slate-400">
          💡 Clique em qualquer célula da tabela para editar inline. Enter salva, Esc cancela.
        </p>
      )}

      {/* Tabela */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-slate-200 bg-white">
          <Database className="w-10 h-10 text-slate-200 mb-3" />
          <p className="text-base font-medium text-slate-800 mb-1">
            {itens.length === 0 ? 'Banco de dados vazio' : 'Nenhum item encontrado'}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            {itens.length === 0 ? 'Cadastre seus serviços e materiais com custo e margem' : 'Tente ajustar os filtros'}
          </p>
          {itens.length === 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setModalImportarAberto(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors"
              >
                <Upload className="w-4 h-4" /> Importar CSV/Excel
              </button>
              <button
                onClick={() => { setEditando(null); setModalNovoAberto(true) }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar primeiro item
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Un.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Custo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Venda</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Margem</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-2.5 min-w-[200px]">
                    <CelulaEditavel item={item} campo="nome" value={item.nome} />
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.codigo && <span className="text-[10px] text-slate-400 font-mono">{item.codigo}</span>}
                      {item.categoria && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${item.categoria.cor}18`, color: item.categoria.cor }}>
                          {item.categoria.icone && <span className="mr-0.5">{item.categoria.icone}</span>}
                          {item.categoria.nome}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 w-16 hidden sm:table-cell">
                    <CelulaEditavel item={item} campo="unidade" value={item.unidade} align="center" />
                  </td>
                  <td className="px-4 py-2.5 text-center hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {TIPO_ITEM_LABEL[item.tipo]}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 w-28">
                    <CelulaEditavel item={item} campo="preco_custo" value={formatCurrency(item.preco_custo)} align="right" />
                  </td>
                  <td className="px-2 py-2.5 w-28">
                    <CelulaEditavel item={item} campo="preco_venda" value={formatCurrency(item.preco_venda)} align="right" />
                  </td>
                  <td className="px-4 py-2.5 text-right hidden lg:table-cell">
                    <span className={cn('text-sm font-medium', item.margem_percentual < 0 ? 'text-red-500' : item.margem_percentual < 20 ? 'text-amber-500' : 'text-[#e8500a]')}>
                      {formatPercent(item.margem_percentual)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setEditando(item); setModalNovoAberto(true) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar no modal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExcluir(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modais */}
      <ModalNovoItem
        aberto={modalNovoAberto}
        onFechar={() => { setModalNovoAberto(false); setEditando(null) }}
        editando={editando}
        categorias={categorias}
        onSalvo={handleSalvo}
      />
      <ModalImportar
        aberto={modalImportarAberto}
        onFechar={() => setModalImportarAberto(false)}
        categorias={categorias}
        onImportado={novos => setItens(prev => [...novos, ...prev])}
      />
      <ModalCategorias
        aberto={modalCategoriasAberto}
        onFechar={() => setModalCategoriasAberto(false)}
        categorias={categorias}
        onAtualizar={setCategorias}
      />
    </div>
  )
}
