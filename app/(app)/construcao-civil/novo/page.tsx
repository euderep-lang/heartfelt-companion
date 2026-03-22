import { Metadata } from 'next'
import { ChatIA } from '@/components/orcamento/ChatIA'

export const metadata: Metadata = { title: 'Novo Orçamento com IA' }

export default function NovoOrcamentoPage() {
  return <ChatIA />
}
