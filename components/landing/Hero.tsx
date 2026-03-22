'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react'

const CHAT_DEMO = [
  { role: 'user', texto: 'Preciso de um orçamento para reforma de banheiro 6m²' },
  { role: 'ai', texto: 'Entendido! Vou estruturar o orçamento completo. Qual o padrão de acabamento? (Básico / Médio / Alto)' },
  { role: 'user', texto: 'Padrão médio, azulejo 60x60' },
  { role: 'ai', texto: '✅ Orçamento gerado!\n\n💰 Total: R$ 8.420,00\n📋 12 itens em 4 grupos\n📄 PDF pronto para enviar' },
]

export function Hero() {
  return (
    <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden bg-slate-50">
      {/* Fundo */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 emerald-radial" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#e8500a]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Conteúdo */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e8500a]/30 bg-[rgba(232,80,10,0.08)] mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e8500a]" />
              <span className="text-xs font-medium text-[#e8500a]">Novo • Geração com IA</span>
            </motion.div>

            {/* Título */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6"
            >
              Chega de{' '}
              <span className="relative">
                <span className="relative z-10">planilha.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-[#e8500a]/20 -skew-x-2" />
              </span>
              <br />
              Seu orçamento<br />
              em <span className="text-[#e8500a]">minutos</span> com IA.
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg"
            >
              O ObraQ gera orçamentos completos de construção civil com inteligência artificial.
              Preciso, profissional e pronto para impressionar seu cliente.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              <Link
                href="/cadastro"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#e8500a] hover:bg-[#c94208] text-white font-bold text-base transition-all shadow-[0_0_30px_rgba(232,80,10,0.3)] hover:shadow-[0_0_40px_rgba(232,80,10,0.4)]"
              >
                Gerar meu primeiro orçamento
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#como-funciona"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 font-medium text-base transition-colors"
              >
                Ver demonstração →
              </a>
            </motion.div>

            {/* Garantias */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              {['14 dias grátis', 'Sem cartão', 'Cancele quando quiser'].map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Demo do chat */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_0_60px_rgba(232,80,10,0.08)]">
              {/* Titlebar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#e8500a]" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                </div>
                <span className="text-xs text-slate-400 ml-2">ObraQ — Chat com IA</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#e8500a]" />
                  <span className="text-xs text-[#e8500a]">GPT-4o</span>
                </div>
              </div>

              {/* Mensagens */}
              <div className="p-4 space-y-3 min-h-[280px]">
                {CHAT_DEMO.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.4 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#e8500a] text-white font-medium rounded-tr-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-sm'
                      }`}
                    >
                      {msg.texto}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input fake */}
              <div className="px-4 py-3 border-t border-slate-200 flex items-center gap-2">
                <div className="flex-1 h-9 rounded-lg bg-slate-50 border border-slate-200" />
                <div className="w-9 h-9 rounded-lg bg-[#e8500a] flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Badge flutuante */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2 }}
              className="absolute -bottom-4 -left-4 bg-[#10B981] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg"
            >
              ✅ Orçamento gerado em 45s
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
