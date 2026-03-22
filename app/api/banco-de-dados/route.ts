import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const itemSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  categoria_id: z.string().uuid().optional().nullable(),
  tipo: z.enum(['servico', 'material', 'equipamento', 'mao_de_obra', 'outro']),
  unidade: z.string().min(1),
  preco_custo: z.number().min(0),
  preco_venda: z.number().min(0),
  codigo: z.string().optional(),
  fonte: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const url = new URL(request.url)
  const busca = url.searchParams.get('busca')
  const tipo = url.searchParams.get('tipo')

  let query = supabase
    .from('itens_banco')
    .select('*, categoria:categorias_itens(*)')
    .eq('empresa_id', perfil.empresa_id)
    .eq('ativo', true)
    .order('nome')

  if (busca) query = query.ilike('nome', `%${busca}%`)
  if (tipo && tipo !== 'todos') query = query.eq('tipo', tipo)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const body = await request.json()
  const dados = itemSchema.parse(body)

  // Gerar código automático se não fornecido
  let codigo = dados.codigo
  if (!codigo) {
    const prefixos: Record<string, string> = {
      servico: 'SV', material: 'MT', mao_de_obra: 'MO', equipamento: 'EQ', outro: 'OT',
    }
    const prefixo = prefixos[dados.tipo] ?? 'IT'

    const { count } = await supabase
      .from('itens_banco')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', perfil.empresa_id)
      .eq('tipo', dados.tipo)

    codigo = `${prefixo}-${String((count ?? 0) + 1).padStart(4, '0')}`
  }

  const { data, error } = await supabase
    .from('itens_banco')
    .insert({ ...dados, empresa_id: perfil.empresa_id, codigo, fonte: dados.fonte ?? 'manual' })
    .select('*, categoria:categorias_itens(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
