import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  status: z.enum(['gerado', 'enviado', 'em_negociacao', 'assinado', 'rejeitado', 'cancelado']).optional(),
  titulo: z.string().min(1).optional(),
  cliente_nome: z.string().optional(),
  cliente_telefone: z.string().optional(),
  observacoes: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { data, error } = await supabase
    .from('orcamentos')
    .update(updates)
    .eq('id', id)
    .eq('empresa_id', perfil?.empresa_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Registrar histórico de status
  if (updates.status) {
    await supabase.from('orcamento_historico_status').insert({
      orcamento_id: id,
      usuario_id: user.id,
      status_novo: updates.status,
    })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('orcamentos')
    .delete()
    .eq('id', id)
    .eq('empresa_id', perfil?.empresa_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
