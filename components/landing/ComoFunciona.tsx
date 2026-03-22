'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Cpu, Check, Send } from 'lucide-react'

const PASSOS = [
  {
    numero: '01',
    icon: MessageSquare,
    titulo: 'Descreva a obra pelo chat',
    descricao: '"Preciso de um orçamento para reforma de apartamento 80m², incluindo hidráulica, elétrica e pintura"',
    cor: '#e8500a',
  },
  {
    numero: '02',
    icon: Cpu,
    titulo: 'A IA extrai tudo',
    descricao: 'Serviços • Materiais • Mão de obra • Quantidades — gerados automaticamente com preços do mercado',
    cor: '#3B82F6',
  },
  {
    numero: '03',
    icon: Check,
    titulo: 'Revise e ajuste',
    descricao: 'Edite qualquer item, quantidade ou preço. O orçamento é 100% seu.',
    cor: '#10B981',
  },
  {
    numero: '04',
    icon: Send,
    titulo: 'Envie para o cliente',
    descricao: 'PDF profissional com papel timbrado + resumo no WhatsApp. Em um clique.',
    cor: '#8B5CF6',
  },
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Como funciona?
          </h2>
          <p className="text-slate-600">4 passos simples para ter um orçamento profissional</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PASSOS.map((passo, i) => (
            <motion.div
              key={passo.numero}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              {/* Linha conectora */}
              {i < PASSOS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%-8px)] w-full h-px border-t border-dashed border-slate-200 z-10" />
              )}

              <div className="text-center">
                {/* Número */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white mb-4 relative z-20">
                  <span className="text-sm font-bold text-slate-400">{passo.numero}</span>
                </div>

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${passo.cor}15` }}
                >
                  <passo.icon className="w-5 h-5" style={{ color: passo.cor }} />
                </div>

                <h3 className="text-sm font-semibold text-slate-900 mb-2">{passo.titulo}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{passo.descricao}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
