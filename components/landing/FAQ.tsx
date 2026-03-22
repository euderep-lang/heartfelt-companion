'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const PERGUNTAS = [
  {
    q: 'Preciso saber usar Excel ou ter conhecimento técnico?',
    a: 'Não. O ObraQ foi desenvolvido para ser simples para qualquer profissional de construção civil. Se você sabe descrever uma obra, já consegue usar o sistema. Sem planilhas, sem fórmulas.',
  },
  {
    q: 'A IA erra os preços?',
    a: 'A IA usa preços de referência do mercado brasileiro (SINAPI 2024/2025) e pode ser calibrada com o seu próprio banco de preços. Você sempre revisa o orçamento antes de enviar.',
  },
  {
    q: 'Posso importar minha tabela de preços atual?',
    a: 'Sim! Você pode importar planilhas CSV ou Excel com seus preços atuais. O sistema mapeia automaticamente as colunas e importa em segundos.',
  },
  {
    q: 'Funciona para qualquer tipo de construção?',
    a: 'O módulo atual é focado em construção civil geral (reformas, construções, manutenção). Em breve lançaremos módulos específicos para elétrica, hidráulica e arquitetura.',
  },
  {
    q: 'E se eu quiser cancelar?',
    a: 'Você pode cancelar quando quiser, sem multa e sem burocracia. Seus dados ficam disponíveis por 30 dias após o cancelamento.',
  },
  {
    q: 'Os dados da minha empresa são seguros?',
    a: 'Sim. O ObraQ usa o Supabase com isolamento completo por empresa (multi-tenant). Nenhuma empresa acessa dados de outra. Todos os dados são criptografados.',
  },
  {
    q: 'Posso personalizar o PDF com minha logo?',
    a: 'Sim! Você faz upload da sua logo e do seu papel timbrado. Cada PDF gerado terá a identidade visual completa da sua empresa.',
  },
  {
    q: 'Como funciona o período de trial?',
    a: 'Você tem 14 dias gratuitos com acesso completo ao plano Profissional. Sem necessidade de cartão de crédito. Ao final do trial, você escolhe o plano que melhor atende sua empresa.',
  },
]

export function FAQ() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Perguntas frequentes
          </h2>
          <p className="text-slate-600">Tiramos as principais dúvidas sobre o ObraQ</p>
        </motion.div>

        <Accordion multiple={false} className="space-y-2">
          {PERGUNTAS.map((item, i) => (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <AccordionItem
                value={`item-${i}`}
                className="border border-slate-200 rounded-xl bg-white px-4 overflow-hidden data-[state=open]:border-[#e8500a]/30"
              >
                <AccordionTrigger className="text-sm font-medium text-slate-900 hover:text-[#e8500a] hover:no-underline py-4 text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600 leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
