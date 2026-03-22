'use client'

import { motion } from 'framer-motion'
import { Bot, BarChart3, FileText, Share2, Edit3, Database, History, Palette } from 'lucide-react'

const FEATURES = [
  {
    icon: Bot,
    titulo: 'Chat Inteligente',
    descricao: 'Descreva a obra, a IA entende e gera o orçamento completo com serviços, materiais e preços.',
  },
  {
    icon: BarChart3,
    titulo: '3 Relatórios em 1',
    descricao: 'Orçamento de custos, vendas e lista de materiais gerados automaticamente e separados.',
  },
  {
    icon: FileText,
    titulo: 'PDF Profissional',
    descricao: 'Gerado com seu papel timbrado e logo. Apresentação que impressiona e fecha contratos.',
  },
  {
    icon: Share2,
    titulo: 'Envio por WhatsApp',
    descricao: 'Compartilhe o resumo do orçamento direto para o WhatsApp do cliente com um clique.',
  },
  {
    icon: Edit3,
    titulo: '100% Editável',
    descricao: 'Ajuste qualquer item, quantidade ou preço antes de enviar. Total controle nas suas mãos.',
  },
  {
    icon: Database,
    titulo: 'Banco de Preços',
    descricao: 'Cadastre seus serviços com custo e margem. A IA usa seus preços para gerar orçamentos precisos.',
  },
  {
    icon: History,
    titulo: 'Histórico e Status',
    descricao: 'Acompanhe cada orçamento: Gerado → Enviado → Em negociação → Assinado.',
  },
  {
    icon: Palette,
    titulo: 'Sua identidade visual',
    descricao: 'Logo, papel timbrado, cores da empresa. Cada PDF com a cara do seu negócio.',
  },
]

export function Features() {
  return (
    <section id="funcionalidades" className="py-20 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Tudo que você precisa para fechar mais obras
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Uma plataforma completa pensada para construtoras e reformadoras brasileiras
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.titulo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-[#e8500a]/30 hover:bg-[rgba(232,80,10,0.02)] transition-all cursor-default"
            >
              <div className="w-9 h-9 rounded-lg bg-[rgba(232,80,10,0.1)] flex items-center justify-center mb-3 group-hover:bg-[rgba(232,80,10,0.15)] transition-colors">
                <feature.icon className="w-4.5 h-4.5 text-[#e8500a]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{feature.titulo}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feature.descricao}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
