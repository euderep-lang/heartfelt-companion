import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

  if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  // Busca orçamento original com todos os dados
  const { data: original, error: errBusca } = await supabase
    .from('orcamentos')
    .select(`
      *,
      secoes:orcamento_secoes(
        *,
        grupos:orcamento_grupos(
          *,
          itens:orcamento_itens(*)
        )
      )
    `)
    .eq('id', id)
    .eq('empresa_id', perfil.empresa_id)
    .single()

  if (errBusca || !original) {
    return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  // Busca próximo número
  const { data: empresa } = await supabase
    .from('empresas')
    .select('prefixo_orcamento, proximo_numero')
    .eq('id', perfil.empresa_id)
    .single()

  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const novoNumero = `${empresa.prefixo_orcamento}-${String(empresa.proximo_numero).padStart(3, '0')}`

  // Cria novo orçamento
  const { data: novo, error: errNovo } = await supabase
    .from('orcamentos')
    .insert({
      empresa_id: perfil.empresa_id,
      criado_por: user.id,
      numero: novoNumero,
      titulo: `${original.titulo} (Cópia)`,
      cliente_nome: original.cliente_nome,
      cliente_email: original.cliente_email,
      cliente_telefone: original.cliente_telefone,
      cliente_cpf_cnpj: original.cliente_cpf_cnpj,
      cliente_endereco: original.cliente_endereco,
      status: 'gerado',
      total_custo: original.total_custo,
      total_venda: original.total_venda,
      margem_total: original.margem_total,
      desconto_percentual: original.desconto_percentual,
      desconto_valor: original.desconto_valor,
      total_final: original.total_final,
      validade_dias: original.validade_dias,
      condicoes_pagamento: original.condicoes_pagamento,
      observacoes: original.observacoes,
      texto_introducao: original.texto_introducao,
      resumo_ia: original.resumo_ia,
      versao: 1,
      orcamento_pai_id: original.id,
    })
    .select()
    .single()

  if (errNovo || !novo) {
    return NextResponse.json({ error: errNovo?.message ?? 'Erro ao criar cópia' }, { status: 500 })
  }

  // Incrementa contador da empresa
  await supabase
    .from('empresas')
    .update({ proximo_numero: empresa.proximo_numero + 1 })
    .eq('id', perfil.empresa_id)

  // Copia seções, grupos e itens
  for (const secao of (original.secoes ?? [])) {
    const { data: novaSecao } = await supabase
      .from('orcamento_secoes')
      .insert({
        orcamento_id: novo.id,
        tipo: secao.tipo,
        titulo: secao.titulo,
        subtotal: secao.subtotal,
        ordem: secao.ordem,
      })
      .select()
      .single()

    if (!novaSecao) continue

    for (const grupo of (secao.grupos ?? [])) {
      const { data: novoGrupo } = await supabase
        .from('orcamento_grupos')
        .insert({
          secao_id: novaSecao.id,
          orcamento_id: novo.id,
          nome: grupo.nome,
          descricao: grupo.descricao,
          subtotal: grupo.subtotal,
          ordem: grupo.ordem,
        })
        .select()
        .single()

      if (!novoGrupo) continue

      for (const item of (grupo.itens ?? [])) {
        await supabase.from('orcamento_itens').insert({
          grupo_id: novoGrupo.id,
          orcamento_id: novo.id,
          secao_tipo: item.secao_tipo,
          item_banco_id: item.item_banco_id,
          codigo: item.codigo,
          descricao: item.descricao,
          unidade: item.unidade,
          quantidade: item.quantidade,
          preco_unitario_custo: item.preco_unitario_custo,
          preco_unitario_venda: item.preco_unitario_venda,
          margem_percentual: item.margem_percentual,
          total_custo: item.total_custo,
          total_venda: item.total_venda,
          notas: item.notas,
          ordem: item.ordem,
        })
      }
    }
  }

  return NextResponse.json(novo)
}
