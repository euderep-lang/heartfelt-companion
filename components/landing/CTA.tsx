'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[#e8500a]/20 bg-[rgba(232,80,10,0.04)] p-10 sm:p-14 relative overflow-hidden"
        >
          {/* Gradiente de fundo */}
          <div className="absolute inset-0 emerald-radial opacity-50" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              Pronto para ganhar tempo<br />
              e <span className="text-[#e8500a]">fechar mais contratos?</span>
            </h2>

            <p className="text-slate-600 mb-8 text-lg">
              Junte-se a mais de 300 empresas que já transformaram seus orçamentos com IA.
            </p>

            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#e8500a] hover:bg-[#c94208] text-white font-bold text-lg transition-all shadow-[0_0_40px_rgba(232,80,10,0.3)] hover:shadow-[0_0_60px_rgba(232,80,10,0.4)]"
            >
              Criar minha conta grátis
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-5 mt-6">
              {['14 dias grátis', 'Sem cartão de crédito', 'Setup em 5 minutos'].map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
