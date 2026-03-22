'use client'

import { motion } from 'framer-motion'
import { Clock, TrendingDown, Ghost } from 'lucide-react'

const DORES = [
  {
    icon: Clock,
    titulo: '4 horas para montar um orçamento simples',
    descricao: 'Planilha, calculadora, preços desatualizados... toda vez o mesmo processo demorado.',
    cor: '#EF4444',
  },
  {
    icon: TrendingDown,
    titulo: 'Esquece de incluir item e perde margem',
    descricao: 'Um item esquecido pode custar caro. Sem checklist automático, o erro humano é inevitável.',
    cor: '#e8500a',
  },
  {
    icon: Ghost,
    titulo: 'Cliente some depois de esperar 3 dias',
    descricao: 'O cliente pediu o orçamento hoje. Em 3 dias ele já escolheu outro que respondeu rápido.',
    cor: '#8B5CF6',
  },
]

const COMPARATIVO = [
  ['3-5 horas', '8 minutos'],
  ['Planilha manual', 'Chat com IA'],
  ['Erro humano', '98% de precisão'],
  ['PDF feio', 'Papel timbrado profissional'],
  ['Sem histórico', 'Histórico completo'],
]

export function Problema() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Você ainda faz orçamento assim?
          </h2>
          <p className="text-slate-600">As 3 dores que custam dinheiro e clientes para construtoras todo dia</p>
        </motion.div>

        {/* Cards de dores */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {DORES.map((dor, i) => (
            <motion.div
              key={dor.titulo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:border-slate-300 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${dor.cor}15` }}
              >
                <dor.icon className="w-5 h-5" style={{ color: dor.cor }} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{dor.titulo}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{dor.descricao}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparativo antes/depois */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="p-6">
              <p className="text-sm font-bold text-[#EF4444] mb-4 uppercase tracking-wider">
                ❌ Sem ObraQ
              </p>
              <div className="space-y-3">
                {COMPARATIVO.map(([antes]) => (
                  <div key={antes} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                    <span className="text-sm text-slate-600">{antes}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-[rgba(232,80,10,0.03)]">
              <p className="text-sm font-bold text-[#10B981] mb-4 uppercase tracking-wider">
                ✅ Com ObraQ
              </p>
              <div className="space-y-3">
                {COMPARATIVO.map(([, depois]) => (
                  <div key={depois} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="text-sm text-slate-900 font-medium">{depois}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
