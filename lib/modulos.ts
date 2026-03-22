import { ClipboardList, Sparkles, Database, ShoppingCart, Package, Users, BarChart2, Grid3x3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Submenu {
  id: string
  label: string
  href: string
  Icon: LucideIcon
  destaque?: boolean
}

export interface Modulo {
  id: string
  nome: string
  emoji: string
  descricao: string
  cor: string
  ativo: boolean
  submenus: Submenu[]
}

export const MODULOS: Modulo[] = [
  {
    id: 'construcao-civil',
    nome: 'Construção Civil',
    emoji: '🏗️',
    descricao: 'Orçamentos para obras, reformas e construções',
    cor: '#F59E0B',
    ativo: true,
    submenus: [
      { id: 'orcamentos', label: 'Meus Orçamentos', href: '/construcao-civil', Icon: ClipboardList },
      { id: 'novo', label: 'Novo Orçamento (IA)', href: '/construcao-civil/novo', Icon: Sparkles, destaque: true },
      { id: 'banco', label: 'Banco de Dados', href: '/banco-de-dados', Icon: Database },
    ],
  },
  {
    id: 'vidracaria',
    nome: 'Vidraçaria',
    emoji: '🪟',
    descricao: 'Orçamentos para vidros, esquadrias e box',
    cor: '#3B82F6',
    ativo: false,
    submenus: [
      { id: 'orcamentos', label: 'Meus Orçamentos', href: '/vidracaria', Icon: ClipboardList },
      { id: 'novo', label: 'Novo Orçamento (IA)', href: '/vidracaria/novo', Icon: Sparkles, destaque: true },
      { id: 'catalogo', label: 'Catálogo de Vidros', href: '/vidracaria/catalogo', Icon: Grid3x3 },
      { id: 'banco', label: 'Tabela de Preços', href: '/vidracaria/banco', Icon: Database },
    ],
  },
  {
    id: 'pdv',
    nome: 'PDV',
    emoji: '🛒',
    descricao: 'Ponto de Venda — vendas balcão e orçamentos rápidos',
    cor: '#10B981',
    ativo: false,
    submenus: [
      { id: 'vendas', label: 'Frente de Caixa', href: '/pdv', Icon: ShoppingCart },
      { id: 'produtos', label: 'Produtos', href: '/pdv/produtos', Icon: Package },
      { id: 'clientes', label: 'Clientes', href: '/pdv/clientes', Icon: Users },
      { id: 'relatorios', label: 'Relatórios', href: '/pdv/relatorios', Icon: BarChart2 },
    ],
  },
]
