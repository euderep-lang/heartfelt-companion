'use client'

import { MODULOS } from '@/lib/modulos'

export function useModulo(moduloId: string) {
  const modulo = MODULOS.find(m => m.id === moduloId)
  return {
    temAcesso: modulo?.ativo ?? false,
    modulo,
  }
}
