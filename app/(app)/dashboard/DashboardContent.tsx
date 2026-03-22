'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, DollarSign, TrendingUp, Calendar, Plus, ArrowRight } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { STATUS_CONFIG, type StatusOrcamento } from '@/types'

interface DashboardContentProps {
  metricas: {
    totalOrcamentos: number
    totalValor: number
    taxaConversao: number
    orçamentosEsteMes: number
  }
  dadosGrafico: { mes: string; total: number }[]
  ultimosOrcamentos: {
    id: string
    status: string
    total_final: number
    created_at: string
  }[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function DashboardContent({ metricas, dadosGrafico, ultimosOrcamentos }: DashboardContentProps) {
  const cards = [
    {
      titulo: 'Total de Orçamentos',
      valor: metricas.totalOrcamentos.toString(),
      icone: FileText,
      variacao: '+12% este mês',
      cor: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      titulo: 'Valor Total Orçado',
      valor: formatCurrency(metricas.totalValor),
      icone: DollarSign,
      variacao: '+8% este mês',
      cor: '#e8500a',
      bg: '#F0FDF4',
    },
    {
      titulo: 'Taxa de Conversão',
      valor: formatPercent(metricas.taxaConversao),
      icone: TrendingUp,
      variacao: 'Assinados / Gerados',
      cor: '#8B5CF6',
      bg: '#F5F3FF',
    },
    {
      titulo: 'Este Mês',
      valor: metricas.orçamentosEsteMes.toString(),
      icone: Calendar,
      variacao: 'Orçamentos gerados',
      cor: '#F59E0B',
      bg: '#FFFBEB',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral do seu negócio</p>
        </div>
        <Link
          href="/construcao-civil/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </Link>
      </div>

      {/* Cards de métricas */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {cards.map((card) => (
          <motion.div
            key={card.titulo}
            variants={item}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-slate-500">{card.titulo}</p>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: card.bg }}
              >
                <card.icone className="w-4 h-4" style={{ color: card.cor }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{card.valor}</p>
            <p className="text-xs text-slate-400">{card.variacao}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Gráfico + Últimos orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-800">Orçamentos por mês</h2>
            <span className="text-xs text-slate-400">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dadosGrafico} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="mes"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                }}
                cursor={{ stroke: '#e8500a20' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#e8500a"
                strokeWidth={2}
                dot={{ fill: '#e8500a', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#e8500a' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Últimos orçamentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Últimos orçamentos</h2>
            <Link
              href="/construcao-civil"
              className="text-xs text-[#e8500a] hover:text-[#c94208] flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {ultimosOrcamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs text-slate-400">Nenhum orçamento ainda</p>
              <Link
                href="/construcao-civil/novo"
                className="text-xs text-[#e8500a] mt-2 hover:underline"
              >
                Criar primeiro
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {ultimosOrcamentos.map((orc) => {
                const statusCfg = STATUS_CONFIG[orc.status as StatusOrcamento]
                return (
                  <Link
                    key={orc.id}
                    href={`/construcao-civil/${orc.id}`}
                    className="flex items-center justify-between py-2 border-b border-slate-100 hover:border-slate-200 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-800 group-hover:text-[#e8500a] transition-colors">
                        {formatCurrency(orc.total_final ?? 0)}
                      </p>
                      <p className="text-[10px] text-slate-400">{formatDate(orc.created_at)}</p>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
                    >
                      {statusCfg.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* CTA vazio */}
      {metricas.totalOrcamentos === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-[#fff5f0] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-[#e8500a]" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Crie seu primeiro orçamento</h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
            Descreva a obra para a IA e receba um orçamento completo em minutos.
          </p>
          <Link
            href="/construcao-civil/novo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar orçamento com IA
          </Link>
        </motion.div>
      )}
    </div>
  )
}
