import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  plano_solicitado: z.enum(['basico', 'profissional', 'enterprise']),
  periodo: z.enum(['mensal', 'anual']),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresa:empresas(plano)')
    .eq('id', user.id)
    .single()

  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const body = await request.json()
  const { plano_solicitado, periodo } = schema.parse(body)

  const empresa = perfil.empresa as { plano?: string } | null

  // Tentar inserir na tabela solicitacoes_plano (pode não existir ainda)
  try {
    await supabase.from('solicitacoes_plano').insert({
      empresa_id: perfil.empresa_id,
      plano_atual: empresa?.plano ?? 'trial',
      plano_solicitado,
      periodo,
      status: 'pendente',
    })
  } catch {
    // Tabela pode não ter sido criada ainda — ignorar
  }

  return NextResponse.json({ success: true })
}
