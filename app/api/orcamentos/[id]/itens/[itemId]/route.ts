import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  descricao: z.string().min(1).optional(),
  quantidade: z.number().min(0).optional(),
  unidade: z.string().optional(),
  preco_unitario_venda: z.number().min(0).optional(),
  preco_unitario_custo: z.number().min(0).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: orcamentoId, itemId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  const body = await request.json()
  const updates = patchSchema.parse(body)

  // Verify the item belongs to the orcamento (which belongs to the company)
  const { data: item, error: errItem } = await supabase
    .from('orcamento_itens')
    .select('*, orcamento:orcamentos!inner(empresa_id)')
    .eq('id', itemId)
    .eq('orcamento_id', orcamentoId)
    .single()

  if (errItem || !item) {
    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((item.orcamento as any)?.empresa_id !== perfil?.empresa_id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  // Compute derived fields
  const qtd = updates.quantidade ?? item.quantidade
  const venda = updates.preco_unitario_venda ?? item.preco_unitario_venda
  const custo = updates.preco_unitario_custo ?? item.preco_unitario_custo

  const totalVenda = qtd * venda
  const totalCusto = qtd * custo
  const margem = venda > 0 && custo > 0 ? ((venda - custo) / venda) * 100 : item.margem_percentual

  const { data, error } = await supabase
    .from('orcamento_itens')
    .update({
      ...updates,
      total_venda: totalVenda,
      total_custo: totalCusto,
      margem_percentual: margem,
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
