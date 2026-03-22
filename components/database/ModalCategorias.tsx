'use client'

import { useState } from 'react'
import { X, Plus, Edit2, Trash2, Loader2, Palette } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { CategoriaItem } from '@/types'
import toast from 'react-hot-toast'

const CORES_PRESET = [
  '#e8500a', '#EF4444', '#3B82F6', '#F59E0B',
  '#8B5CF6', '#EC4899', '#F97316', '#14B8A6',
]

const EMOJIS_PRESET = ['🏗️', '🪟', '🔧', '🪣', '🧱', '🪵', '⚡', '💧', '🎨', '🏠', '🛠️', '📦']

interface ModalCategoriasProps {
  aberto: boolean
  onFechar: () => void
  categorias: CategoriaItem[]
  onAtualizar: (categorias: CategoriaItem[]) => void
}

export function ModalCategorias({ aberto, onFechar, categorias, onAtualizar }: ModalCategoriasProps) {
  const [lista, setLista] = useState(categorias)
  const [novoNome, setNovoNome] = useState('')
  const [novaCor, setNovaCor] = useState('#e8500a')
  const [novoIcone, setNovoIcone] = useState('')
  const [criando, setCriando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')

  async function handleCriar() {
    if (!novoNome.trim()) return
    setCriando(true)
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome.trim(), cor: novaCor, icone: novoIcone }),
      })
      if (!res.ok) { toast.error('Erro ao criar categoria'); return }
      const nova = await res.json()
      const novaLista = [...lista, nova]
      setLista(novaLista)
      onAtualizar(novaLista)
      setNovoNome('')
      setNovoIcone('')
      toast.success('Categoria criada!')
    } finally {
      setCriando(false)
    }
  }

  async function handleEditar(cat: CategoriaItem) {
    if (!editNome.trim()) return
    const res = await fetch(`/api/categorias/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: editNome.trim() }),
    })
    if (res.ok) {
      const atualizada = await res.json()
      const novaLista = lista.map(c => c.id === cat.id ? atualizada : c)
      setLista(novaLista)
      onAtualizar(novaLista)
      setEditandoId(null)
      toast.success('Categoria atualizada!')
    } else {
      toast.error('Erro ao atualizar')
    }
  }

  async function handleExcluir(id: string) {
    const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
    if (res.ok) {
      const novaLista = lista.filter(c => c.id !== id)
      setLista(novaLista)
      onAtualizar(novaLista)
      toast.success('Categoria excluída')
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Erro ao excluir')
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={v => !v && onFechar()}>
      <DialogContent showCloseButton={false} className="bg-white border border-slate-200 max-w-md w-full p-0 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Gerenciar Categorias
          </DialogTitle>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Lista de categorias */}
          {lista.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhuma categoria criada</p>
          ) : (
            <div className="space-y-1.5">
              {lista.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 group hover:bg-white transition-colors">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.cor }} />
                  {cat.icone && <span className="text-sm">{cat.icone}</span>}

                  {editandoId === cat.id ? (
                    <input
                      autoFocus
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEditar(cat)
                        if (e.key === 'Escape') setEditandoId(null)
                      }}
                      className="flex-1 px-2 py-1 rounded bg-white border border-[#ff9c6a] text-sm text-slate-900 outline-none focus:ring-1 focus:ring-[#e8500a]/20"
                    />
                  ) : (
                    <span className="flex-1 text-sm text-slate-800">{cat.nome}</span>
                  )}

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editandoId === cat.id ? (
                      <button
                        onClick={() => handleEditar(cat)}
                        className="text-xs text-[#e8500a] hover:text-[#c94208] transition-colors"
                      >
                        ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEditandoId(cat.id); setEditNome(cat.nome) }}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleExcluir(cat.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Criar nova */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Nova Categoria</p>

            <div className="space-y-3">
              <input
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCriar()}
                placeholder="Nome da categoria"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e8500a]/60 focus:ring-1 focus:ring-[#e8500a]/20"
              />

              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1"><Palette className="w-3 h-3" /> Cor</p>
                <div className="flex flex-wrap gap-2">
                  {CORES_PRESET.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setNovaCor(cor)}
                      className={cn('w-6 h-6 rounded-full border-2 transition-transform hover:scale-110', novaCor === cor ? 'border-slate-700 scale-110' : 'border-transparent')}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                  <input
                    type="color"
                    value={novaCor}
                    onChange={e => setNovaCor(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1.5">Ícone (emoji)</p>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJIS_PRESET.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNovoIcone(novoIcone === emoji ? '' : emoji)}
                      className={cn('w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-colors', novoIcone === emoji ? 'border-[#f0733a] bg-[#fff5f0]' : 'border-slate-200 hover:border-slate-300 bg-white')}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCriar}
                disabled={!novoNome.trim() || criando}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {criando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Criar Categoria
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
