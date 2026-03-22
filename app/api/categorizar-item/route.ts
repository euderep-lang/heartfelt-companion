import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encontrarCategoriaPorKeyword } from '@/lib/categorias-construcao'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, descricao } = await request.json()
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  // Tentar por keywords (grátis e instantâneo)
  const categoriaKeyword = encontrarCategoriaPorKeyword(nome, descricao)
  if (categoriaKeyword) {
    return NextResponse.json({ categoria: categoriaKeyword, metodo: 'keywords', confianca: 'alta' })
  }

  // Fallback: OpenAI se disponível
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({ categoria: 'Outros', metodo: 'fallback', confianca: 'baixa' })
    }

    const { CATEGORIAS_CONSTRUCAO } = await import('@/lib/categorias-construcao')
    const nomes = CATEGORIAS_CONSTRUCAO.map(c => c.nome).join(', ')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em construção civil. Classifique o item na categoria mais adequada. Categorias: ${nomes}. Responda APENAS com o nome exato da categoria.`,
          },
          {
            role: 'user',
            content: `Item: "${nome}"${descricao ? `\nDescrição: "${descricao}"` : ''}`,
          },
        ],
        max_tokens: 30,
        temperature: 0,
      }),
    })

    if (res.ok) {
      const json = await res.json()
      const categoriaIA = json.choices?.[0]?.message?.content?.trim() ?? 'Outros'
      const valida = CATEGORIAS_CONSTRUCAO.find(c => c.nome === categoriaIA)?.nome ?? 'Outros'
      return NextResponse.json({ categoria: valida, metodo: 'ia', confianca: 'media' })
    }
  } catch {
    // Falha silenciosa
  }

  return NextResponse.json({ categoria: 'Outros', metodo: 'fallback', confianca: 'baixa' })
}
