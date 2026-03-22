'use client'

import { create } from 'zustand'
import type { Orcamento, MensagemChat, OrcamentoGerado } from '@/types'

interface OrcamentoState {
  // Chat
  mensagens: MensagemChat[]
  sessaoId: string | null
  carregandoIA: boolean
  orcamentoGerado: OrcamentoGerado | null

  // Orçamento atual
  orcamentoAtual: Orcamento | null
  abaAtiva: 'vendas' | 'custos' | 'materiais'

  // Lista
  orcamentos: Orcamento[]
  carregando: boolean

  // Ações
  adicionarMensagem: (mensagem: MensagemChat) => void
  limparChat: () => void
  setSessaoId: (id: string) => void
  setCarregandoIA: (loading: boolean) => void
  setOrcamentoGerado: (orcamento: OrcamentoGerado | null) => void
  setOrcamentoAtual: (orcamento: Orcamento | null) => void
  setAbaAtiva: (aba: 'vendas' | 'custos' | 'materiais') => void
  setOrcamentos: (orcamentos: Orcamento[]) => void
  setCarregando: (loading: boolean) => void
}

export const useOrcamentoStore = create<OrcamentoState>((set) => ({
  mensagens: [],
  sessaoId: null,
  carregandoIA: false,
  orcamentoGerado: null,
  orcamentoAtual: null,
  abaAtiva: 'vendas',
  orcamentos: [],
  carregando: false,

  adicionarMensagem: (mensagem) =>
    set((state) => ({ mensagens: [...state.mensagens, mensagem] })),

  limparChat: () =>
    set({ mensagens: [], sessaoId: null, orcamentoGerado: null }),

  setSessaoId: (id) => set({ sessaoId: id }),
  setCarregandoIA: (loading) => set({ carregandoIA: loading }),
  setOrcamentoGerado: (orcamento) => set({ orcamentoGerado: orcamento }),
  setOrcamentoAtual: (orcamento) => set({ orcamentoAtual: orcamento }),
  setAbaAtiva: (aba) => set({ abaAtiva: aba }),
  setOrcamentos: (orcamentos) => set({ orcamentos }),
  setCarregando: (loading) => set({ carregando: loading }),
}))
