import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrcamentoViewer } from '@/components/orcamento/OrcamentoViewer'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('orcamentos').select('titulo, numero').eq('id', id).single()
  return { title: data ? `${data.numero} — ${data.titulo}` : 'Orçamento' }
}

export default async function OrcamentoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: orcamento, error } = await supabase
    .from('orcamentos')
    .select(`
      *,
      secoes:orcamento_secoes(
        *,
        grupos:orcamento_grupos(
          *,
          itens:orcamento_itens(*)
        )
      ),
      historico:orcamento_historico_status(*)
    `)
    .eq('id', id)
    .single()

  if (error || !orcamento) {
    notFound()
  }

  return <OrcamentoViewer orcamento={orcamento} />
}
