'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANOS = [
  {
    nome: 'Básico',
    descricao: 'Para quem está começando',
    precoMensal: 97,
    precoAnual: 68,
    features: [
      '50 orçamentos/mês',
      '1 usuário',
      'PDF básico',
      'IA limitada',
      'Suporte por e-mail',
    ],
    destaque: false,
    cta: 'Começar grátis',
  },
  {
    nome: 'Profissional',
    descricao: 'Para empresas em crescimento',
    precoMensal: 197,
    precoAnual: 138,
    features: [
      'Orçamentos ilimitados',
      'Até 5 usuários',
      'PDF com papel timbrado',
      'IA completa (GPT-4o)',
      'Suporte prioritário',
      'Banco de preços ilimitado',
      'Envio WhatsApp',
    ],
    destaque: true,
    cta: 'Começar grátis',
  },
  {
    nome: 'Enterprise',
    descricao: 'Para grandes operações',
    precoMensal: 497,
    precoAnual: 348,
    features: [
      'Orçamentos ilimitados',
      'Usuários ilimitados',
      'Multi-empresas',
      'API + Integrações',
      'Suporte dedicado',
      'Onboarding personalizado',
    ],
    destaque: false,
    cta: 'Falar com vendas',
  },
]

export function Precos() {
  const [anual, setAnual] = useState(false)

  return (
    <section id="precos" className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Planos e preços
          </h2>
          <p className="text-slate-600 mb-6">Comece grátis por 14 dias. Sem cartão de crédito.</p>

          {/* Toggle mensal/anual */}
          <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-slate-50 border border-slate-200">
            <button
              onClick={() => setAnual(false)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                !anual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnual(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                anual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              )}
            >
              Anual
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(232,80,10,0.15)] text-[#e8500a] font-semibold">
                -30%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {PLANOS.map((plano, i) => (
            <motion.div
              key={plano.nome}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'rounded-xl border p-6 flex flex-col relative',
                plano.destaque
                  ? 'border-[#e8500a]/50 bg-[rgba(232,80,10,0.03)] shadow-[0_0_40px_rgba(232,80,10,0.08)]'
                  : 'border-slate-200 bg-white'
              )}
            >
              {plano.destaque && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#e8500a] text-white">
                    <Zap className="w-3 h-3" /> Mais popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-900 mb-0.5">{plano.nome}</h3>
                <p className="text-xs text-slate-600">{plano.descricao}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">
                    R$ {anual ? plano.precoAnual : plano.precoMensal}
                  </span>
                  <span className="text-sm text-slate-400">/mês</span>
                </div>
                {anual && (
                  <p className="text-xs text-[#10B981] mt-0.5">
                    Cobrado anualmente (R$ {plano.precoAnual * 12}/ano)
                  </p>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plano.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/cadastro"
                className={cn(
                  'w-full py-2.5 rounded-lg font-semibold text-sm text-center transition-all',
                  plano.destaque
                    ? 'bg-[#e8500a] hover:bg-[#c94208] text-white'
                    : 'border border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                {plano.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
