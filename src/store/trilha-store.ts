import { create } from "zustand"

import type { DegrauDaTrilha } from "@/components/layout/trilha"

/**
 * A trilha da tela atual, publicada pelo `DashboardLayout` para o cabeçalho de
 * cima mostrar (`lib/cabecalho-do-modulo.ts`). Os dois não são pai e filho: a
 * casca monta o cabeçalho, a tela monta o `DashboardLayout`.
 */
interface TrilhaState {
  degraus: DegrauDaTrilha[]
  atual: string | null
  definir: (degraus: DegrauDaTrilha[], atual: string) => void
}

export const useTrilhaStore = create<TrilhaState>((set, get) => ({
  degraus: [],
  atual: null,
  definir: (degraus, atual) => {
    const agora = get()
    /* Só grava quando muda: o `DashboardLayout` chama a cada render. */
    if (
      agora.atual === atual &&
      agora.degraus.length === degraus.length &&
      agora.degraus.every((d, i) => d.url === degraus[i].url && d.title === degraus[i].title)
    )
      return
    set({ degraus, atual })
  },
}))
