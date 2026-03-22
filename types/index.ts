// =============================================
// ObraQ V2 — Tipos TypeScript
// =============================================

// Planos do sistema
export type Plano = 'trial' | 'basico' | 'profissional' | 'enterprise'
export type PlanoPeriodo = 'mensal' | 'anual'
export type RoleUsuario = 'owner' | 'admin' | 'membro'
export type StatusOrcamento = 'gerado' | 'enviado' | 'em_negociacao' | 'assinado' | 'rejeitado' | 'cancelado'
export type TipoSecao = 'custos' | 'vendas' | 'materiais'
export type TipoItem = 'servico' | 'material' | 'equipamento' | 'mao_de_obra' | 'outro'

// Empresa (multi-tenant)
export interface Empresa {
  id: string
  nome: string
  cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  site?: string
  logo_url?: string
  papel_timbrado_url?: string
  cor_primaria: string
  cor_secundaria: string
  cor_texto: string
  responsavel_nome?: string
  responsavel_cargo?: string
  responsavel_telefone?: string
  responsavel_email?: string
  moeda: string
  prefixo_orcamento: string
  proximo_numero: number
  texto_introducao?: string
  texto_validade: string
  texto_condicoes_pagamento?: string
  texto_observacoes?: string
  plano: Plano
  plano_periodo: PlanoPeriodo
  plano_ativo: boolean
  trial_expira_em: string
  created_at: string
  updated_at: string
}

// Perfil do usuário
export interface Perfil {
  id: string
  empresa_id: string
  nome?: string
  email?: string
  cargo?: string
  avatar_url?: string
  role: RoleUsuario
  tema: string
  idioma: string
  notificacoes_email: boolean
  created_at: string
  updated_at: string
  empresa?: Empresa
}

// Categoria de itens
export interface CategoriaItem {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  cor: string
  icone?: string
  ordem: number
  created_at: string
}

// Item do banco de dados de preços
export interface ItemBanco {
  id: string
  empresa_id: string
  categoria_id?: string
  codigo?: string
  nome: string
  descricao?: string
  unidade: string
  tipo: TipoItem
  preco_custo: number
  preco_venda: number
  margem_percentual: number
  ativo: boolean
  fonte?: string
  created_at: string
  updated_at: string
  categoria?: CategoriaItem
}

// Orçamento principal
export interface Orcamento {
  id: string
  empresa_id: string
  criado_por?: string
  numero: string
  titulo: string
  cliente_nome?: string
  cliente_email?: string
  cliente_telefone?: string
  cliente_cpf_cnpj?: string
  cliente_endereco?: string
  status: StatusOrcamento
  total_custo: number
  total_venda: number
  margem_total: number
  desconto_percentual: number
  desconto_valor: number
  total_final: number
  validade_dias: number
  data_validade?: string
  condicoes_pagamento?: string
  observacoes?: string
  texto_introducao?: string
  contexto_conversa?: MensagemChat[]
  resumo_ia?: string
  versao: number
  orcamento_pai_id?: string
  enviado_em?: string
  assinado_em?: string
  rejeitado_em?: string
  created_at: string
  updated_at: string
  secoes?: OrcamentoSecao[]
  historico?: OrcamentoHistoricoStatus[]
}

// Seção do orçamento
export interface OrcamentoSecao {
  id: string
  orcamento_id: string
  tipo: TipoSecao
  titulo?: string
  subtotal: number
  ordem: number
  created_at: string
  grupos?: OrcamentoGrupo[]
}

// Grupo dentro de uma seção
export interface OrcamentoGrupo {
  id: string
  secao_id: string
  orcamento_id: string
  nome: string
  descricao?: string
  subtotal: number
  ordem: number
  created_at: string
  itens?: OrcamentoItem[]
}

// Item de um grupo
export interface OrcamentoItem {
  id: string
  grupo_id: string
  orcamento_id: string
  secao_tipo: TipoSecao
  item_banco_id?: string
  codigo?: string
  descricao: string
  unidade?: string
  quantidade: number
  preco_unitario_custo: number
  preco_unitario_venda: number
  margem_percentual: number
  total_custo: number
  total_venda: number
  notas?: string
  ordem: number
  created_at: string
  updated_at: string
}

// Histórico de status
export interface OrcamentoHistoricoStatus {
  id: string
  orcamento_id: string
  usuario_id?: string
  status_anterior?: string
  status_novo: string
  observacao?: string
  created_at: string
  usuario?: Pick<Perfil, 'id' | 'nome' | 'avatar_url'>
}

// Mensagem do chat de IA
export interface MensagemChat {
  id: string
  orcamento_id?: string
  empresa_id: string
  sessao_id?: string
  role: 'user' | 'assistant' | 'system'
  conteudo: string
  metadados?: Record<string, unknown>
  tokens_usados?: number
  created_at: string
}

// =============================================
// Tipos do orçamento gerado pela IA
// =============================================

export interface ItemOrcamentoGerado {
  descricao: string
  unidade: string
  quantidade: number
  preco_unitario_custo: number
  preco_unitario_venda: number
  total_custo: number
  total_venda: number
}

export interface ItemMaterialGerado {
  descricao: string
  unidade: string
  quantidade: number
  preco_unitario: number
  total: number
  fornecedor_sugerido?: string
}

export interface GrupoOrcamentoGerado {
  nome: string
  itens: ItemOrcamentoGerado[]
}

export interface GrupoMaterialGerado {
  nome: string
  itens: ItemMaterialGerado[]
}

export interface OrcamentoGerado {
  titulo: string
  cliente_nome?: string
  resumo_ia: string
  custos: {
    grupos: GrupoOrcamentoGerado[]
    total: number
  }
  vendas: {
    grupos: GrupoOrcamentoGerado[]
    total: number
    margem_percentual: number
  }
  materiais: {
    grupos: GrupoMaterialGerado[]
    total: number
  }
}

// =============================================
// Limites por plano
// =============================================

export const LIMITES_PLANO: Record<Plano, { orcamentos: number; usuarios: number }> = {
  trial: { orcamentos: 10, usuarios: 1 },
  basico: { orcamentos: 50, usuarios: 1 },
  profissional: { orcamentos: -1, usuarios: 5 },
  enterprise: { orcamentos: -1, usuarios: -1 },
}

// =============================================
// Labels e cores de status
// =============================================

export const STATUS_CONFIG: Record<StatusOrcamento, { label: string; color: string; bg: string }> = {
  gerado: { label: 'Gerado', color: '#9999AA', bg: 'rgba(153,153,170,0.1)' },
  enviado: { label: 'Enviado', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  em_negociacao: { label: 'Em Negociação', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  assinado: { label: 'Assinado', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  rejeitado: { label: 'Rejeitado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  cancelado: { label: 'Cancelado', color: '#55556A', bg: 'rgba(85,85,106,0.1)' },
}

export const TIPO_ITEM_LABEL: Record<TipoItem, string> = {
  servico: 'Serviço',
  material: 'Material',
  equipamento: 'Equipamento',
  mao_de_obra: 'Mão de Obra',
  outro: 'Outro',
}

export const UNIDADES_COMUNS = [
  'un', 'm²', 'm³', 'm', 'kg', 'hr', 'vb', 'sc', 'ld', 'pc', 'pç', 'cx', 'gl', 'l', 'pt',
]
