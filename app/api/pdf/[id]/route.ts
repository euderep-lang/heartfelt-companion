import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { OrcamentoPDF } from '@/components/pdf/OrcamentoPDF'
import type { Orcamento, Empresa } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar orçamento com todas as seções, grupos e itens
    const { data: orcamento, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        secoes:orcamento_secoes (
          *,
          grupos:orcamento_grupos (
            *,
            itens:orcamento_itens (*)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Buscar dados da empresa
    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('id', user.id)
      .single()

    const { data: empresa } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', perfil?.empresa_id)
      .single()

    // Ordenar seções e grupos
    const orcamentoOrdenado = {
      ...orcamento,
      secoes: (orcamento.secoes ?? [])
        .sort((a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem)
        .map((s: { grupos?: Array<{ ordem: number; itens?: Array<{ ordem: number }> }> }) => ({
          ...s,
          grupos: (s.grupos ?? [])
            .sort((a, b) => a.ordem - b.ordem)
            .map(g => ({
              ...g,
              itens: (g.itens ?? []).sort((a, b) => a.ordem - b.ordem),
            })),
        })),
    }

    const buffer = await renderToBuffer(
      OrcamentoPDF({ orcamento: orcamentoOrdenado as Orcamento, empresa: empresa as Empresa })
    )

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="orcamento-${orcamento.numero}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Erro ao gerar PDF:', err)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
