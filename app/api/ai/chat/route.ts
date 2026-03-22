import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { openai, MODEL } from '@/lib/openai'
import { SYSTEM_PROMPT_ORCAMENTO, detectarModo } from '@/lib/prompts/orcamento'
import { createClient } from '@/lib/supabase/server'

const chatSchema = z.object({
  mensagem: z.string().min(1).max(2000),
  historico: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).default([]),
  sessaoId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar empresa do usuário
    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('id', user.id)
      .single()

    if (!perfil?.empresa_id) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { mensagem, historico, sessaoId } = chatSchema.parse(body)

    // Detectar modo (pacote fechado vs inteligente)
    const primeiraMsg = historico.length === 0 ? mensagem : (historico.find(h => h.role === 'user')?.content ?? mensagem)
    const modo = detectarModo(primeiraMsg)

    // Buscar banco de dados de preços da empresa
    const bancoDados = await buscarBancoDadosEmpresa(supabase, perfil.empresa_id)

    const contextoBanco = {
      role: 'system' as const,
      content: `BANCO DE DADOS DE PREÇOS DA EMPRESA (use estes preços prioritariamente):\n${JSON.stringify(bancoDados.slice(0, 150))}\n\nMODO ATUAL: ${modo}`,
    }

    // Construir histórico para a IA
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT_ORCAMENTO },
      contextoBanco,
      ...historico.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: mensagem },
    ]

    // Stream de resposta
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Processar em background
    ;(async () => {
      try {
        const completion = await openai.chat.completions.create({
          model: MODEL,
          messages,
          stream: true,
          max_tokens: 4096,
          temperature: 0.3,
        })

        let fullContent = ''

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content ?? ''
          fullContent += delta

          if (delta) {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: delta })}\n\n`)
            )
          }
        }

        // Verificar se a IA quer gerar o orçamento (JSON embutido na resposta)
        if (fullContent.includes('"acao": "gerar_orcamento"') || fullContent.includes('"acao":"gerar_orcamento"')) {
          const jsonMatch = fullContent.match(/```json\n?([\s\S]*?)\n?```/)

          if (jsonMatch) {
            try {
              const orcamento = JSON.parse(jsonMatch[1])

              if (orcamento.acao === 'gerar_orcamento') {
                // Salvar itens sugeridos no banco de preços
                if (Array.isArray(orcamento.itens_sugeridos_para_banco) && orcamento.itens_sugeridos_para_banco.length > 0) {
                  const itensSugeridos = orcamento.itens_sugeridos_para_banco
                    .filter((it: Record<string, unknown>) => it.sugerido_para_banco === true)
                    .map((it: Record<string, unknown>) => ({
                      empresa_id: perfil.empresa_id,
                      nome: it.nome as string,
                      unidade: it.unidade as string ?? 'un',
                      tipo: it.tipo as string ?? 'servico',
                      preco_custo: Number(it.preco_custo) || 0,
                      preco_venda: Number(it.preco_venda) || 0,
                      fonte: 'ia',
                      ativo: true,
                    }))

                  if (itensSugeridos.length > 0) {
                    await supabase.from('itens_banco').insert(itensSugeridos)
                  }
                }

                // Salvar orçamento no banco
                const orcamentoId = await salvarOrcamento(
                  supabase,
                  perfil.empresa_id,
                  user.id,
                  orcamento,
                  [...messages, { role: 'assistant' as const, content: fullContent }]
                )

                if (orcamentoId) {
                  await writer.write(
                    encoder.encode(`data: ${JSON.stringify({ type: 'orcamento_gerado', orcamento_id: orcamentoId })}\n\n`)
                  )
                }
              }
            } catch {
              // Erro ao parsear JSON — ignorar
            }
          }
        }

        // Salvar mensagens no banco
        const msgs = [
          {
            empresa_id: perfil.empresa_id,
            sessao_id: sessaoId,
            role: 'user',
            conteudo: mensagem,
          },
          {
            empresa_id: perfil.empresa_id,
            sessao_id: sessaoId,
            role: 'assistant',
            conteudo: fullContent,
          },
        ]
        await supabase.from('mensagens_chat').insert(msgs)

        await writer.write(encoder.encode('data: [DONE]\n\n'))
      } catch (error) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Erro interno' })}\n\n`)
        )
      } finally {
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Busca itens do banco de preços da empresa para contexto da IA
async function buscarBancoDadosEmpresa(
  supabase: Awaited<ReturnType<typeof createClient>>,
  empresaId: string
) {
  const { data } = await supabase
    .from('itens_banco')
    .select('nome, unidade, tipo, preco_custo, preco_venda, margem_percentual')
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('nome')
    .limit(200)

  return data ?? []
}

// Função auxiliar para salvar orçamento no Supabase
async function salvarOrcamento(
  supabase: Awaited<ReturnType<typeof createClient>>,
  empresaId: string,
  userId: string,
  orcamento: Record<string, unknown>,
  historico: { role: string; content: string }[]
): Promise<string | null> {
  try {
    // Buscar próximo número
    const { data: empresa } = await supabase
      .from('empresas')
      .select('prefixo_orcamento, proximo_numero')
      .eq('id', empresaId)
      .single()

    const prefixo = empresa?.prefixo_orcamento ?? 'OBQ'
    const numero = empresa?.proximo_numero ?? 1
    const numeroFormatado = `${prefixo}-${String(numero).padStart(3, '0')}`

    // Calcular totais
    const vendas = orcamento.vendas as { total?: number; margem_percentual?: number }
    const custos = orcamento.custos as { total?: number }
    const totalVenda = vendas?.total ?? 0
    const totalCusto = custos?.total ?? 0

    // Inserir orçamento
    const { data: novoOrcamento, error } = await supabase
      .from('orcamentos')
      .insert({
        empresa_id: empresaId,
        criado_por: userId,
        numero: numeroFormatado,
        titulo: orcamento.titulo as string ?? 'Orçamento sem título',
        cliente_nome: orcamento.cliente_nome as string ?? null,
        status: 'gerado',
        total_custo: totalCusto,
        total_venda: totalVenda,
        margem_total: vendas?.margem_percentual ?? 0,
        total_final: totalVenda,
        resumo_ia: orcamento.resumo_ia as string ?? null,
        contexto_conversa: historico,
      })
      .select('id')
      .single()

    if (error || !novoOrcamento) return null

    // Atualizar próximo número
    await supabase
      .from('empresas')
      .update({ proximo_numero: numero + 1 })
      .eq('id', empresaId)

    const orcamentoId = novoOrcamento.id

    // Inserir seções, grupos e itens
    const tiposSecao: ('custos' | 'vendas' | 'materiais')[] = ['custos', 'vendas', 'materiais']

    for (const tipo of tiposSecao) {
      const secaoData = orcamento[tipo] as {
        grupos?: Array<{
          nome: string
          itens?: Array<Record<string, unknown>>
        }>
        total?: number
      }
      if (!secaoData) continue

      const { data: secao } = await supabase
        .from('orcamento_secoes')
        .insert({
          orcamento_id: orcamentoId,
          tipo,
          titulo: tipo === 'custos' ? 'Orçamento de Custos' : tipo === 'vendas' ? 'Orçamento de Vendas' : 'Lista de Materiais',
          subtotal: secaoData.total ?? 0,
          ordem: tiposSecao.indexOf(tipo),
        })
        .select('id')
        .single()

      if (!secao) continue

      // Inserir grupos
      const grupos = secaoData.grupos ?? []
      for (let gi = 0; gi < grupos.length; gi++) {
        const grupo = grupos[gi]
        const itens = grupo.itens ?? []
        const subtotalGrupo = itens.reduce((sum: number, it: Record<string, unknown>) => {
          return sum + (Number(tipo === 'materiais' ? it.total : it.total_venda) || 0)
        }, 0)

        const { data: grupoDb } = await supabase
          .from('orcamento_grupos')
          .insert({
            secao_id: secao.id,
            orcamento_id: orcamentoId,
            nome: grupo.nome,
            subtotal: subtotalGrupo,
            ordem: gi,
          })
          .select('id')
          .single()

        if (!grupoDb) continue

        // Inserir itens
        const itensParaInserir = itens.map((it: Record<string, unknown>, ii: number) => ({
          grupo_id: grupoDb.id,
          orcamento_id: orcamentoId,
          secao_tipo: tipo,
          descricao: it.descricao as string ?? '',
          unidade: it.unidade as string ?? 'un',
          quantidade: Number(it.quantidade) || 1,
          preco_unitario_custo: Number(it.preco_unitario_custo ?? it.preco_unitario) || 0,
          preco_unitario_venda: Number(it.preco_unitario_venda ?? it.preco_unitario) || 0,
          margem_percentual: 0,
          ordem: ii,
        }))

        if (itensParaInserir.length > 0) {
          await supabase.from('orcamento_itens').insert(itensParaInserir)
        }
      }
    }

    return orcamentoId
  } catch {
    return null
  }
}
