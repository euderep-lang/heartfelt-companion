import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  categoria_id: z.string().uuid().optional().nullable(),
  tipo: z.enum(['servico', 'material', 'equipamento', 'mao_de_obra', 'outro']).optional(),
  unidade: z.string().optional(),
  preco_custo: z.number().min(0).optional(),
  preco_venda: z.number().min(0).optional(),
  ativo: z.boolean().optional(),
})

async function getPerfil(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('perfis').select('empresa_id').eq('id', userId).single()
  return data
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const perfil = await getPerfil(supabase, user.id)
  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const body = await request.json()
  const updates = patchSchema.parse(body)

  const { data, error } = await supabase
    .from('itens_banco')
    .update(updates)
    .eq('id', id)
    .eq('empresa_id', perfil.empresa_id)
    .select('*, categoria:categorias_itens(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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

  const perfil = await getPerfil(supabase, user.id)
  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  // Soft delete — manter histórico
  const { error } = await supabase
    .from('itens_banco')
    .update({ ativo: false })
    .eq('id', id)
    .eq('empresa_id', perfil.empresa_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
