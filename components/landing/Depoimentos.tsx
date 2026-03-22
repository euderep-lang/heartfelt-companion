'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const DEPOIMENTOS = [
  {
    nome: 'Roberto Almeida',
    empresa: 'Construtora Almeida',
    cidade: 'São Paulo, SP',
    texto: 'Antes levava 4 horas pra fazer um orçamento. Hoje faço em 10 minutos e o cliente fica impressionado com a apresentação profissional.',
    stars: 5,
    inicial: 'R',
    cor: '#e8500a',
  },
  {
    nome: 'Carla Mendonça',
    empresa: 'CMR Reformas',
    cidade: 'Rio de Janeiro, RJ',
    texto: 'A IA entende exatamente o que eu preciso. Já fechei 3 contratos só essa semana usando o ObraQ. Meu faturamento aumentou 40%.',
    stars: 5,
    inicial: 'C',
    cor: '#10B981',
  },
  {
    nome: 'Fábio Santos',
    empresa: 'FS Construções',
    cidade: 'Belo Horizonte, MG',
    texto: 'Meu banco de preços sempre atualizado, orçamento preciso. Nunca mais perdi margem por esquecer de incluir um item. Vale cada centavo.',
    stars: 5,
    inicial: 'F',
    cor: '#3B82F6',
  },
]

export function Depoimentos() {
  return (
    <section id="depoimentos" className="py-20 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Quem já usa o ObraQ
          </h2>
          <p className="text-slate-600">Construtoras e reformadoras de todo o Brasil transformando seus resultados</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {DEPOIMENTOS.map((dep, i) => (
            <motion.div
              key={dep.nome}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: dep.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-[#e8500a] text-[#e8500a]" />
                ))}
              </div>

              {/* Depoimento */}
              <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">
                &ldquo;{dep.texto}&rdquo;
              </p>

              {/* Autor */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: dep.cor }}
                >
                  {dep.inicial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{dep.nome}</p>
                  <p className="text-xs text-slate-400">{dep.empresa} • {dep.cidade}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
