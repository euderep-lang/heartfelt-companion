import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de moeda brasileira
export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

// Formatação de percentual
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

// Formatação de data
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Formatação de CNPJ
export function formatCNPJ(cnpj: string): string {
  const nums = cnpj.replace(/\D/g, '')
  return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Formatação de telefone
export function formatTelefone(tel: string): string {
  const nums = tel.replace(/\D/g, '')
  if (nums.length === 11) {
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

// Gerar número de orçamento
export function gerarNumeroOrcamento(prefixo: string, numero: number): string {
  return `${prefixo}-${String(numero).padStart(3, '0')}`
}

// Calcular margem percentual
export function calcularMargem(custo: number, venda: number): number {
  if (venda === 0) return 0
  return ((venda - custo) / venda) * 100
}

// Calcular preço de venda a partir de margem desejada
export function calcularVendaPorMargem(custo: number, margem: number): number {
  if (margem >= 100) return custo
  return custo / (1 - margem / 100)
}

// Truncar texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Gerar ID de sessão aleatório para chat
export function gerarSessaoId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// Formatar mensagem WhatsApp com o orçamento
export function formatarMensagemWhatsApp(params: {
  numeroOrcamento: string
  clienteNome: string
  titulo: string
  dataEmissao: string
  dataValidade: string
  servicos: string[]
  totalFinal: number
}): string {
  const servicos = params.servicos.map(s => `• ${s}`).join('\n')

  return `*ObraQ — Orçamento Nº ${params.numeroOrcamento}* 🏗️

Olá, *${params.clienteNome}*!

Segue o resumo do orçamento para a obra solicitada:

📋 *${params.titulo}*
📅 Emitido em: ${params.dataEmissao}
⏳ Válido até: ${params.dataValidade}

💼 *Serviços inclusos:*
${servicos}

💰 *Valor total: ${formatCurrency(params.totalFinal)}*

📎 O PDF completo foi anexado a esta mensagem.

Para aceitar ou tirar dúvidas, responda esta mensagem.

_ObraQ — Orçamentos inteligentes para construção civil_`
}
