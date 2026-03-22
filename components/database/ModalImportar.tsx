'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ItemBanco, CategoriaItem, TipoItem } from '@/types'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

type Passo = 1 | 2 | 3

interface ItemImportado {
  nome: string
  unidade: string
  preco_custo: number
  preco_venda: number
  tipo: TipoItem
  categoria?: string
}

interface ModalImportarProps {
  aberto: boolean
  onFechar: () => void
  categorias: CategoriaItem[]
  onImportado: (itens: ItemBanco[]) => void
}

const CAMPOS_DESTINO = [
  { value: 'nome', label: 'Nome/Descrição' },
  { value: 'unidade', label: 'Unidade' },
  { value: 'preco_custo', label: 'Preço de Custo' },
  { value: 'preco_venda', label: 'Preço de Venda' },
  { value: 'tipo', label: 'Tipo' },
  { value: 'ignorar', label: 'Ignorar coluna' },
]

export function ModalImportar({ aberto, onFechar, categorias, onImportado }: ModalImportarProps) {
  const [passo, setPasso] = useState<Passo>(1)
  const [arrastando, setArrastando] = useState(false)
  const [cabecalhos, setCabecalhos] = useState<string[]>([])
  const [linhas, setLinhas] = useState<string[][]>([])
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({})
  const [importando, setImportando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function resetar() {
    setPasso(1)
    setCabecalhos([])
    setLinhas([])
    setMapeamento({})
  }

  function handleFechar() {
    resetar()
    onFechar()
  }

  function parseCSV(text: string) {
    const result = Papa.parse<string[]>(text, { skipEmptyLines: true })
    if (result.data.length < 2) { toast.error('Arquivo sem dados'); return }
    const [header, ...rows] = result.data
    setCabecalhos(header)
    setLinhas(rows.slice(0, 5))
    autoMapear(header)
    setPasso(2)
  }

  function parseExcel(buffer: ArrayBuffer) {
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][]
    if (data.length < 2) { toast.error('Planilha sem dados'); return }
    const [header, ...rows] = data
    setCabecalhos(header.map(String))
    setLinhas(rows.slice(0, 5).map(r => r.map(String)))
    autoMapear(header.map(String))
    setPasso(2)
  }

  function autoMapear(headers: string[]) {
    const mapa: Record<string, string> = {}
    headers.forEach(h => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (['nome', 'descricao', 'descr', 'item', 'servico'].some(k => lower.includes(k))) mapa[h] = 'nome'
      else if (['unidade', 'unid', 'un'].some(k => lower.includes(k))) mapa[h] = 'unidade'
      else if (['custo', 'cost', 'preco_custo', 'precoc'].some(k => lower.includes(k))) mapa[h] = 'preco_custo'
      else if (['venda', 'sale', 'precov', 'preco_venda'].some(k => lower.includes(k))) mapa[h] = 'preco_venda'
      else if (['tipo', 'type', 'categoria'].some(k => lower.includes(k))) mapa[h] = 'tipo'
      else mapa[h] = 'ignorar'
    })
    setMapeamento(mapa)
  }

  async function handleArquivo(file: File) {
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv') {
      const text = await file.text()
      parseCSV(text)
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer()
      parseExcel(buffer)
    } else {
      toast.error('Formato não suportado. Use CSV ou Excel (.xlsx)')
    }
  }

  async function handleImportar() {
    const res = await fetch('/api/banco-de-dados')
    if (!res.ok) { toast.error('Erro de conexão'); return }

    if (!inputRef.current?.files?.[0]) {
      toast.error('Arquivo não encontrado')
      return
    }

    const file = inputRef.current.files[0]
    const ext = file.name.split('.').pop()?.toLowerCase()
    let todasLinhas: string[][] = []

    if (ext === 'csv') {
      const text = await file.text()
      const result = Papa.parse<string[]>(text, { skipEmptyLines: true })
      todasLinhas = result.data.slice(1)
    } else {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][]
      todasLinhas = data.slice(1).map(r => r.map(String))
    }

    setImportando(true)
    const itensCriados: ItemBanco[] = []

    for (const linha of todasLinhas) {
      const item: Record<string, string> = {}
      cabecalhos.forEach((h, i) => {
        const campo = mapeamento[h]
        if (campo && campo !== 'ignorar') item[campo] = linha[i] ?? ''
      })

      if (!item.nome?.trim()) continue

      const payload = {
        nome: item.nome.trim(),
        unidade: item.unidade?.trim() || 'un',
        preco_custo: parseFloat(item.preco_custo?.replace(',', '.') ?? '0') || 0,
        preco_venda: parseFloat(item.preco_venda?.replace(',', '.') ?? '0') || 0,
        tipo: (['servico', 'material', 'equipamento', 'mao_de_obra', 'outro'].includes(item.tipo?.toLowerCase())
          ? item.tipo.toLowerCase()
          : 'servico') as TipoItem,
        fonte: 'importacao',
      }

      try {
        const r = await fetch('/api/banco-de-dados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (r.ok) itensCriados.push(await r.json())
      } catch { /* ignorar linha com erro */ }
    }

    setImportando(false)

    if (itensCriados.length > 0) {
      onImportado(itensCriados)
      toast.success(`${itensCriados.length} iten(s) importado(s) com sucesso!`)
      handleFechar()
      setPasso(3)
    } else {
      toast.error('Nenhum item foi importado. Verifique o mapeamento.')
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={v => !v && handleFechar()}>
      <DialogContent showCloseButton={false} className="bg-white border border-slate-200 max-w-2xl w-full p-0 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-base font-semibold text-slate-900">
              Importar CSV / Excel
            </DialogTitle>
            <div className="flex items-center gap-1.5">
              {([1, 2, 3] as Passo[]).map(n => (
                <div key={n} className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors', passo >= n ? 'bg-[#e8500a] text-white' : 'bg-slate-100 text-slate-400')}>
                  {passo > n ? <Check className="w-3 h-3" /> : n}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleFechar} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Passo 1: Upload */}
          {passo === 1 && (
            <div>
              <p className="text-sm text-slate-500 mb-4">Faça upload do seu arquivo CSV ou Excel com os itens do banco de preços.</p>
              <div
                onDragOver={e => { e.preventDefault(); setArrastando(true) }}
                onDragLeave={() => setArrastando(false)}
                onDrop={e => { e.preventDefault(); setArrastando(false); const f = e.dataTransfer.files[0]; if (f) handleArquivo(f) }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
                  arrastando ? 'border-[#f0733a] bg-[#fff5f0]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700 mb-1">Arraste ou clique para selecionar</p>
                <p className="text-xs text-slate-400">CSV, XLSX, XLS — máx. 5MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleArquivo(f) }}
                />
              </div>
            </div>
          )}

          {/* Passo 2: Mapeamento */}
          {passo === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Mapeie as colunas do arquivo para os campos do sistema:</p>
              <div className="space-y-2">
                {cabecalhos.map(h => (
                  <div key={h} className="flex items-center gap-3">
                    <div className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                      <p className="text-xs font-medium text-slate-800">{h}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Ex: {linhas[0]?.[cabecalhos.indexOf(h)] ?? '—'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                    <select
                      value={mapeamento[h] ?? 'ignorar'}
                      onChange={e => setMapeamento(prev => ({ ...prev, [h]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#e8500a]/60 cursor-pointer"
                    >
                      {CAMPOS_DESTINO.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {!Object.values(mapeamento).includes('nome') && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Mapeie pelo menos a coluna &quot;Nome/Descrição&quot; para continuar.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPasso(1)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleImportar}
                  disabled={importando || !Object.values(mapeamento).includes('nome')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {importando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {importando ? 'Importando...' : 'Confirmar importação'}
                </button>
              </div>
            </div>
          )}

          {/* Passo 3: Sucesso */}
          {passo === 3 && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#fff5f0] flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#e8500a]" />
              </div>
              <p className="text-lg font-bold text-slate-900 mb-1">Importação concluída!</p>
              <p className="text-sm text-slate-500">Os itens foram adicionados ao seu banco de dados.</p>
              <button
                onClick={handleFechar}
                className="mt-6 px-6 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
