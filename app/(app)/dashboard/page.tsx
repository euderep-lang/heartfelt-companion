import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from './DashboardContent'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar métricas do dashboard
  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user!.id)
    .single()

  const empresaId = perfil?.empresa_id

  // Métricas paralelas
  const [orcamentosResult, orcamentosAssRej] = await Promise.all([
    supabase
      .from('orcamentos')
      .select('id, status, total_final, created_at')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false }),
    supabase
      .from('orcamentos')
      .select('status')
      .eq('empresa_id', empresaId),
  ])

  const orcamentos = orcamentosResult.data ?? []
  const todos = orcamentosAssRej.data ?? []

  const totalOrcamentos = orcamentos.length
  const totalValor = orcamentos.reduce((sum, o) => sum + (o.total_final ?? 0), 0)

  const assinados = todos.filter(o => o.status === 'assinado').length
  const taxaConversao = totalOrcamentos > 0 ? (assinados / totalOrcamentos) * 100 : 0

  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const orçamentosEsteMes = orcamentos.filter(
    o => new Date(o.created_at) >= inicioMes
  ).length

  // Dados para gráfico (últimos 6 meses)
  const dadosGrafico = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const mes = d.toLocaleString('pt-BR', { month: 'short' })
    const ano = d.getFullYear()
    const mesNum = d.getMonth()
    const count = orcamentos.filter(o => {
      const data = new Date(o.created_at)
      return data.getMonth() === mesNum && data.getFullYear() === ano
    }).length
    return { mes: mes.charAt(0).toUpperCase() + mes.slice(1), total: count }
  })

  return (
    <DashboardContent
      metricas={{
        totalOrcamentos,
        totalValor,
        taxaConversao,
        orçamentosEsteMes,
      }}
      dadosGrafico={dadosGrafico}
      ultimosOrcamentos={orcamentos.slice(0, 5)}
    />
  )
}
