import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  nome: z.string().min(1).optional(),
  cor: z.string().optional(),
  icone: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const body = await request.json()
  const updates = patchSchema.parse(body)

  const { data, error } = await supabase
    .from('categorias_itens')
    .update(updates)
    .eq('id', id)
    .eq('empresa_id', perfil.empresa_id)
    .select()
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

  const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  // Verificar itens vinculados
  const { count } = await supabase
    .from('itens_banco')
    .select('*', { count: 'exact', head: true })
    .eq('categoria_id', id)
    .eq('ativo', true)

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `Esta categoria possui ${count} iten(s) vinculado(s). Desvincule-os antes de excluir.` },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('categorias_itens')
    .delete()
    .eq('id', id)
    .eq('empresa_id', perfil.empresa_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
