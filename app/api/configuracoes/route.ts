import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const empresaSchema = z.object({
  nome: z.string().min(2).optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  site: z.string().optional(),
  endereco: z.string().optional(),
  responsavel_nome: z.string().optional(),
  responsavel_cargo: z.string().optional(),
  responsavel_telefone: z.string().optional(),
  responsavel_email: z.string().email().optional().or(z.literal('')),
  prefixo_orcamento: z.string().min(1).max(10).optional(),
  texto_validade: z.string().optional(),
  texto_condicoes_pagamento: z.string().optional(),
  texto_observacoes: z.string().optional(),
  texto_introducao: z.string().optional(),
  cor_primaria: z.string().optional(),
  cor_secundaria: z.string().optional(),
})

const perfilSchema = z.object({
  nome: z.string().min(1).optional(),
  cargo: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  const url = new URL(request.url)
  const tipo = url.searchParams.get('tipo') ?? 'empresa'

  const body = await request.json()

  if (tipo === 'perfil') {
    const updates = perfilSchema.parse(body)
    const { data, error } = await supabase
      .from('perfis')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Default: empresa
  const updates = empresaSchema.parse(body)
  const { data, error } = await supabase
    .from('empresas')
    .update(updates)
    .eq('id', perfil?.empresa_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
