import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const categoriaSchema = z.object({
  nome: z.string().min(1),
  cor: z.string().optional().default('#F59E0B'),
  icone: z.string().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return NextResponse.json([], { status: 200 })

  const { data } = await supabase
    .from('categorias_itens')
    .select('*')
    .eq('empresa_id', perfil.empresa_id)
    .order('nome')

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const body = await request.json()
  const dados = categoriaSchema.parse(body)

  const { data, error } = await supabase
    .from('categorias_itens')
    .insert({ ...dados, empresa_id: perfil.empresa_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
