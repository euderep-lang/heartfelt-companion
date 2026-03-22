import { createClient } from '@/lib/supabase/server'
import { ConfiguracoesContent } from './ConfiguracoesContent'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Configurações' }

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfis')
    .select('*, empresa:empresas(*)')
    .eq('id', user!.id)
    .single()

  return <ConfiguracoesContent perfil={perfil} empresa={perfil?.empresa ?? null} />
}
