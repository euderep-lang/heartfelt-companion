'use client'

import { create } from 'zustand'
import type { Empresa, Perfil } from '@/types'

interface AppState {
  perfil: Perfil | null
  empresa: Empresa | null
  sidebarColapsada: boolean
  setPerfil: (perfil: Perfil | null) => void
  setEmpresa: (empresa: Empresa | null) => void
  toggleSidebar: () => void
  setSidebarColapsada: (colapsada: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  perfil: null,
  empresa: null,
  sidebarColapsada: false,

  setPerfil: (perfil) => set({ perfil }),
  setEmpresa: (empresa) => set({ empresa }),
  toggleSidebar: () => set((state) => ({ sidebarColapsada: !state.sidebarColapsada })),
  setSidebarColapsada: (colapsada) => set({ sidebarColapsada: colapsada }),
}))
