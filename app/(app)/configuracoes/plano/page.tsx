import { createClient } from '@/lib/supabase/server'
import { LIMITES_PLANO } from '@/types'
import { formatDate } from '@/lib/utils'
import { CreditCard, TrendingUp, Users, FileText } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Plano & Billing' }

const PLANO_LABEL = {
  trial: 'Trial',
  basico: 'Básico',
  profissional: 'Profissional',
  enterprise: 'Enterprise',
}

export default async function PlanoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user!.id)
    .single()

  const { data: empresa } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', perfil?.empresa_id)
    .single()

  const { count: totalOrcamentos } = await supabase
    .from('orcamentos')
    .select('id', { count: 'exact', head: true })
    .eq('empresa_id', perfil?.empresa_id)

  const planoAtual = (empresa?.plano ?? 'trial') as keyof typeof LIMITES_PLANO
  const limites = LIMITES_PLANO[planoAtual]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plano & Billing</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie sua assinatura</p>
      </div>

      {/* Plano atual */}
      <div className="rounded-xl border border-[#ffc4a0] bg-[#fff5f0]/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Plano atual</p>
            <h2 className="text-2xl font-bold text-slate-900">
              {PLANO_LABEL[planoAtual]}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {empresa?.plano === 'trial'
                ? `Trial expira em ${formatDate(empresa.trial_expira_em)}`
                : `Renovação em ${empresa?.plano_periodo}`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffe8dc] flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#e8500a]" />
          </div>
        </div>

        {empresa?.plano === 'trial' && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
            ⚡ Seu trial expira em breve. Faça upgrade para não perder o acesso.
          </div>
        )}
      </div>

      {/* Uso */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#e8500a]" />
            <p className="text-xs text-slate-500">Orçamentos</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalOrcamentos ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">
            {limites.orcamentos === -1
              ? 'Ilimitados'
              : `de ${limites.orcamentos} disponíveis`}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-slate-500">Usuários</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">1</p>
          <p className="text-xs text-slate-400 mt-1">
            {limites.usuarios === -1
              ? 'Ilimitados'
              : `de ${limites.usuarios} disponíveis`}
          </p>
        </div>
      </div>

      {/* CTA upgrade */}
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <TrendingUp className="w-8 h-8 text-[#e8500a] mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">Fazer upgrade de plano</h3>
        <p className="text-sm text-slate-500 mb-4">
          Desbloqueie orçamentos ilimitados, mais usuários e funcionalidades premium.
        </p>
        <Link
          href="/precos"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e8500a] hover:bg-[#c94208] text-white font-semibold text-sm transition-colors"
        >
          Ver planos disponíveis
        </Link>
        <p className="text-xs text-slate-400 mt-2">Integração com pagamento em breve</p>
      </div>
    </div>
  )
}
