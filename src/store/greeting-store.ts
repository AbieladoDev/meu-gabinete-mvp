import { create } from "zustand"

import { useAuthStore } from "@/store/auth-store"

export type Greeting = {
  kind: "welcome" | "goodbye"
  /** Nome completo — só o primeiro aparece. */
  name: string
  avatarUrl: string | null
}

/**
 * Boas-vindas (depois do login) e tchau (ao sair). Quem PEDE é o login
 * (`welcome`) e o botão de sair (`goodbye`); quem MOSTRA, navega e faz o
 * logout é o `GreetingLayer`, montado no layout RAIZ.
 *
 * ⚠️ No layout raiz, e não no login nem no painel: a camada tem de sobreviver
 * à troca de rota. Morando numa das telas, ela some junto com a página no
 * instante da navegação e aparece um quadro da tela seguinte carregando
 * (a "piscada" corrigida no todosDan-client em 11/10/2026).
 */
export const useGreetingStore = create<{
  current: Greeting | null
  welcome: (name: string, avatarUrl: string | null) => void
  /** Nome e foto saem do login atual — o logout de fato é no fim da animação. */
  goodbye: () => void
  finish: () => void
}>()((set, get) => ({
  current: null,
  welcome: (name, avatarUrl) =>
    set({ current: { kind: "welcome", name, avatarUrl } }),
  goodbye: () => {
    if (get().current) return
    const { user } = useAuthStore.getState()
    set({
      current: {
        kind: "goodbye",
        name: user?.name ?? "",
        avatarUrl: user?.avatarUrl ?? null,
      },
    })
  },
  finish: () => set({ current: null }),
}))
