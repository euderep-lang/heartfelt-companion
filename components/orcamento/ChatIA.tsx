'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, ArrowLeft, Bot, User, Loader2, CheckCircle } from 'lucide-react'
import { cn, gerarSessaoId } from '@/lib/utils'
import { useOrcamentoStore } from '@/store/useOrcamentoStore'
import toast from 'react-hot-toast'
import type { MensagemChat } from '@/types'

const SUGESTOES = [
  'Reforma de banheiro completo',
  'Pintura interna apartamento',
  'Construção de churrasqueira',
  'Reforma de cozinha',
  'Cobertura em telha metálica',
  'Muro em alvenaria',
]

export function ChatIA() {
  const router = useRouter()
  const { mensagens, adicionarMensagem, carregandoIA, setCarregandoIA, setSessaoId, sessaoId, limparChat } = useOrcamentoStore()
  const [input, setInput] = useState('')
  const [orcamentoSalvoId, setOrcamentoSalvoId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    limparChat()
    setSessaoId(gerarSessaoId())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const enviarMensagem = useCallback(async (texto: string) => {
    if (!texto.trim() || carregandoIA) return

    const novaMensagem: MensagemChat = {
      id: Date.now().toString(),
      empresa_id: '',
      sessao_id: sessaoId ?? undefined,
      role: 'user',
      conteudo: texto,
      created_at: new Date().toISOString(),
    }

    adicionarMensagem(novaMensagem)
    setInput('')
    setCarregandoIA(true)

    const tempId = `temp_${Date.now()}`
    adicionarMensagem({
      id: tempId,
      empresa_id: '',
      sessao_id: sessaoId ?? undefined,
      role: 'assistant',
      conteudo: '',
      created_at: new Date().toISOString(),
    })

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: texto,
          historico: mensagens.map(m => ({ role: m.role, content: m.conteudo })),
          sessaoId,
        }),
      })

      if (!response.ok) throw new Error('Erro na comunicação com a IA')

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let conteudoCompleto = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              if (parsed.type === 'text') {
                conteudoCompleto += parsed.content
                useOrcamentoStore.setState(state => ({
                  mensagens: state.mensagens.map(m =>
                    m.id === tempId ? { ...m, conteudo: conteudoCompleto } : m
                  ),
                }))
              }

              if (parsed.type === 'orcamento_gerado') {
                setOrcamentoSalvoId(parsed.orcamento_id)
              }
            } catch {
              // Ignorar chunks inválidos
            }
          }
        }
      }

      useOrcamentoStore.setState(state => ({
        mensagens: state.mensagens.map(m =>
          m.id === tempId ? { ...m, id: `msg_${Date.now()}`, conteudo: conteudoCompleto } : m
        ),
      }))
    } catch {
      toast.error('Erro ao comunicar com a IA. Tente novamente.')
      useOrcamentoStore.setState(state => ({
        mensagens: state.mensagens.filter(m => m.id !== tempId),
      }))
    } finally {
      setCarregandoIA(false)
    }
  }, [carregandoIA, mensagens, sessaoId, adicionarMensagem, setCarregandoIA])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensagem(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header do chat */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-4 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#fff5f0] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#e8500a]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Novo Orçamento com IA</h1>
            <p className="text-xs text-slate-400">Descreva a obra e a IA monta tudo</p>
          </div>
        </div>

        {orcamentoSalvoId && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => router.push(`/construcao-civil/${orcamentoSalvoId}`)}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Ver orçamento completo
          </motion.button>
        )}
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50">
        {/* Mensagem inicial */}
        {mensagens.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#ffe8dc] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-[#e8500a]" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm">
                <p className="text-sm text-slate-800 mb-2">
                  Olá! Sou o <span className="text-[#e8500a] font-semibold">ObraQ AI</span>, seu assistente de orçamentos de construção civil.
                </p>
                <p className="text-sm text-slate-500 mb-2">
                  Descreva a obra e eu monto o orçamento completo com custos, materiais e preços de venda.
                </p>
                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mt-2 border border-slate-100">
                  💡 Exemplo: &quot;Preciso orçar uma reforma de cozinha 15m², inclui demolição, revestimento 60x60, instalação de armários e pintura&quot;
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2 pl-11">Ou escolha uma sugestão:</p>
              <div className="flex flex-wrap gap-2 pl-11">
                {SUGESTOES.map(s => (
                  <button
                    key={s}
                    onClick={() => enviarMensagem(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-[#e8500a] hover:border-[#ff9c6a] hover:bg-[#fff5f0] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mensagens */}
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {mensagens.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    msg.role === 'user'
                      ? 'bg-[#e8500a]'
                      : 'bg-[#ffe8dc]'
                  )}
                >
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-[#e8500a]" />
                  }
                </div>

                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 max-w-sm text-sm',
                    msg.role === 'user'
                      ? 'bg-[#e8500a] text-white rounded-tr-sm font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                  )}
                >
                  {msg.conteudo === '' && msg.role === 'assistant' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e8500a] animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e8500a] animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e8500a] animate-bounce [animation-delay:300ms]" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.conteudo}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-slate-200 bg-white shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Descreva a obra... (Enter para enviar)"
                rows={1}
                style={{ resize: 'none' }}
                className={cn(
                  'w-full px-4 py-3 pr-4 rounded-xl border border-slate-200 bg-white',
                  'text-sm text-slate-900 placeholder:text-slate-400',
                  'focus:outline-none focus:border-[#e8500a]/50 focus:ring-1 focus:ring-[#e8500a]/20',
                  'transition-all min-h-[48px] max-h-[120px] leading-relaxed'
                )}
              />
            </div>
            <button
              onClick={() => enviarMensagem(input)}
              disabled={!input.trim() || carregandoIA}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0',
                input.trim() && !carregandoIA
                  ? 'bg-[#e8500a] hover:bg-[#c94208] text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              {carregandoIA
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Shift+Enter para nova linha • Enter para enviar
          </p>
        </div>
      </div>
    </div>
  )
}
