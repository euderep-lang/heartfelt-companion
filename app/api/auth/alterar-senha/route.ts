import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(8),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { senhaAtual, novaSenha } = schema.parse(body)

  // Reautenticar com senha atual
  const { error: reAuthError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: senhaAtual,
  })

  if (reAuthError) {
    return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
  }

  // Atualizar senha
  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
