import { createClient } from '@/lib/supabase/server'
import { TabelaPrecos } from '@/components/database/TabelaPrecos'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Banco de Dados' }

export default async function BancoDeDadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user!.id)
    .single()

  const [{ data: itens }, { data: categorias }] = await Promise.all([
    supabase
      .from('itens_banco')
      .select('*, categoria:categorias_itens(*)')
      .eq('empresa_id', perfil?.empresa_id)
      .eq('ativo', true)
      .order('nome'),
    supabase
      .from('categorias_itens')
      .select('*')
      .eq('empresa_id', perfil?.empresa_id)
      .order('nome'),
  ])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <TabelaPrecos itens={itens ?? []} categorias={categorias ?? []} />
    </div>
  )
}
