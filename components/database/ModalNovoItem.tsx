'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Calculator, Sparkles } from 'lucide-react'
import { cn, calcularMargem, calcularVendaPorMargem } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { TIPO_ITEM_LABEL, UNIDADES_COMUNS, type ItemBanco, type CategoriaItem, type TipoItem } from '@/types'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  descricao: z.string().optional(),
  categoria_id: z.string().optional(),
  tipo: z.enum(['servico', 'material', 'equipamento', 'mao_de_obra', 'outro']),
  unidade: z.string().min(1, 'Unidade obrigatória'),
  preco_custo: z.number({ error: 'Informe o custo' }).min(0),
  preco_venda: z.number({ error: 'Informe o preço de venda' }).min(0),
})

type FormData = z.infer<typeof schema>

interface ModalNovoItemProps {
  aberto: boolean
  onFechar: () => void
  editando?: ItemBanco | null
  categorias: CategoriaItem[]
  onSalvo: (item: ItemBanco) => void
}

export function ModalNovoItem({ aberto, onFechar, editando, categorias, onSalvo }: ModalNovoItemProps) {
  const [salvando, setSalvando] = useState(false)
  const [margem, setMargem] = useState(0)
  const [modoMargem, setModoMargem] = useState(false)
  const [categoriaSugerida, setCategoriaSugerida] = useState<string | null>(null)
  const [carregandoCategoria, setCarregandoCategoria] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      descricao: '',
      categoria_id: '',
      tipo: 'servico',
      unidade: 'm²',
      preco_custo: 0,
      preco_venda: 0,
    },
  })

  const custo = watch('preco_custo')
  const venda = watch('preco_venda')
  const nomeAtual = watch('nome')

  // Debounce the name for auto-categorization
  const nomeDebounced = useDebounce(nomeAtual, 800)

  useEffect(() => {
    if (!modoMargem) {
      setMargem(parseFloat(calcularMargem(Number(custo), Number(venda)).toFixed(1)))
    }
  }, [custo, venda, modoMargem])

  useEffect(() => {
    if (editando) {
      reset({
        nome: editando.nome,
        descricao: editando.descricao ?? '',
        categoria_id: editando.categoria_id ?? '',
        tipo: editando.tipo,
        unidade: editando.unidade,
        preco_custo: editando.preco_custo,
        preco_venda: editando.preco_venda,
      })
      setMargem(parseFloat(calcularMargem(editando.preco_custo, editando.preco_venda).toFixed(1)))
    } else {
      reset({ nome: '', descricao: '', categoria_id: '', tipo: 'servico', unidade: 'm²', preco_custo: 0, preco_venda: 0 })
      setMargem(0)
    }
    setModoMargem(false)
    setCategoriaSugerida(null)
  }, [editando, aberto, reset])

  // Auto-categorize when name changes (only for new items)
  useEffect(() => {
    if (editando || nomeDebounced.length < 3) return

    const categoriaAtual = watch('categoria_id')
    if (categoriaAtual) return // don't overwrite manual selection

    setCarregandoCategoria(true)
    setCategoriaSugerida(null)

    fetch('/api/categorizar-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeDebounced }),
    })
      .then(r => r.json())
      .then(({ categoria }) => {
        if (categoria && categoria !== 'Outros') {
          const cat = categorias.find(c => c.nome === categoria)
          if (cat) {
            setCategoriaSugerida(categoria)
          }
        }
      })
      .catch(() => {})
      .finally(() => setCarregandoCategoria(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomeDebounced, editando])

  function aceitarSugestao() {
    const cat = categorias.find(c => c.nome === categoriaSugerida)
    if (cat) {
      setValue('categoria_id', cat.id)
      setCategoriaSugerida(null)
    }
  }

  function handleMargemChange(v: string) {
    const m = parseFloat(v) || 0
    setMargem(m)
    const custoVal = Number(custo)
    if (custoVal > 0 && m < 100) {
      setValue('preco_venda', parseFloat(calcularVendaPorMargem(custoVal, m).toFixed(2)))
    }
  }

  async function onSubmit(data: FormData) {
    setSalvando(true)
    try {
      const url = editando ? `/api/banco-de-dados/${editando.id}` : '/api/banco-de-dados'
      const method = editando ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          categoria_id: data.categoria_id || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Erro ao salvar')
        return
      }

      const salvo = await res.json()
      toast.success(editando ? 'Item atualizado!' : 'Item adicionado ao banco!')
      onSalvo(salvo)
      onFechar()
    } finally {
      setSalvando(false)
    }
  }

  const margemColor = margem < 0 ? 'text-red-500' : margem < 20 ? 'text-amber-500' : 'text-[#e8500a]'

  function Campo({
    label,
    name,
    placeholder,
    type = 'text',
    required,
  }: {
    label: string
    name: keyof FormData
    placeholder?: string
    type?: string
    required?: boolean
  }) {
    return (
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          {...register(name, { valueAsNumber: type === 'number' })}
          type={type}
          placeholder={placeholder}
          step={type === 'number' ? '0.01' : undefined}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-1 transition-colors',
            errors[name]
              ? 'border-red-400 focus:ring-red-400/20'
              : 'border-slate-200 focus:border-[#e8500a]/60 focus:ring-[#e8500a]/20'
          )}
        />
        {errors[name] && <p className="text-xs text-red-500 mt-0.5">{errors[name]?.message}</p>}
      </div>
    )
  }

  return (
    <Dialog open={aberto} onOpenChange={v => !v && onFechar()}>
      <DialogContent
        showCloseButton={false}
        className="bg-white border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <DialogTitle className="text-base font-semibold text-slate-900">
            {editando ? 'Editar Item' : 'Novo Item no Banco'}
          </DialogTitle>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Nome */}
          <Campo label="Nome / Descrição" name="nome" placeholder="Assentamento de azulejo 60x60" required />

          {/* Categoria + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Categoria</label>
                {carregandoCategoria && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Identificando...
                  </span>
                )}
              </div>

              {/* Sugestão da IA */}
              {categoriaSugerida && !carregandoCategoria && (
                <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-1.5 bg-[#fff5f0] border border-[#ffc4a0] rounded-lg">
                  <Sparkles className="w-3 h-3 text-[#e8500a] shrink-0" />
                  <span className="text-[11px] text-slate-700 flex-1 truncate">
                    <span className="font-semibold text-[#e8500a]">{categoriaSugerida}</span>
                  </span>
                  <button
                    type="button"
                    onClick={aceitarSugestao}
                    className="text-[10px] bg-[#e8500a] text-white px-2 py-0.5 rounded hover:bg-[#c94208] shrink-0"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoriaSugerida(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              )}

              <select
                {...register('categoria_id')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 cursor-pointer"
              >
                <option value="">Sem categoria</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                {...register('tipo')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 cursor-pointer"
              >
                {(Object.entries(TIPO_ITEM_LABEL) as [TipoItem, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Unidade */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Unidade <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                {...register('unidade')}
                placeholder="m²"
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400',
                  'focus:outline-none focus:ring-1 transition-colors',
                  errors.unidade ? 'border-red-400' : 'border-slate-200 focus:border-[#e8500a]/60 focus:ring-[#e8500a]/20'
                )}
              />
              <div className="flex flex-wrap gap-1 items-center">
                {UNIDADES_COMUNS.slice(0, 6).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setValue('unidade', u)}
                    className="px-2 py-1 rounded text-[10px] border border-slate-200 text-slate-500 hover:border-[#ff9c6a] hover:text-[#e8500a] hover:bg-[#fff5f0] transition-colors"
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Precificação */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-3.5 h-3.5 text-[#e8500a]" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Precificação</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Preço de Custo (R$)" name="preco_custo" type="number" placeholder="0,00" required />
              <Campo label="Preço de Venda (R$)" name="preco_venda" type="number" placeholder="0,00" required />
            </div>

            {/* Margem */}
            <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-600">
                  Margem de Lucro
                  <span className={cn('ml-2 font-bold', margemColor)}>
                    {margem.toFixed(1)}%
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setModoMargem(v => !v)}
                  className="text-[10px] text-[#e8500a] hover:underline"
                >
                  {modoMargem ? 'Calcular pela margem' : 'Definir margem →'}
                </button>
              </div>
              {modoMargem && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={margem}
                    onChange={e => handleMargemChange(e.target.value)}
                    min={0}
                    max={99}
                    step={0.1}
                    className="w-24 px-3 py-1.5 rounded-lg border border-[#ff9c6a] bg-white text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#e8500a]/20"
                  />
                  <span className="text-sm text-slate-500">% → calcula o preço de venda</span>
                </div>
              )}
              {!modoMargem && (
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', margem < 0 ? 'bg-red-400' : margem < 20 ? 'bg-amber-400' : 'bg-[#e8500a]')}
                    style={{ width: `${Math.min(Math.max(margem, 0), 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editando ? 'Salvar alterações' : 'Adicionar ao banco'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
