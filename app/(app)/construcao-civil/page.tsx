import { createClient } from '@/lib/supabase/server'
import { TabelaHistorico } from '@/components/orcamento/TabelaHistorico'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Meus Orçamentos' }

export default async function OrcamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user!.id)
    .single()

  const { data: orcamentos } = await supabase
    .from('orcamentos')
    .select('id, numero, titulo, cliente_nome, cliente_telefone, total_final, status, created_at')
    .eq('empresa_id', perfil?.empresa_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <TabelaHistorico orcamentos={orcamentos ?? []} />
    </div>
  )
}
