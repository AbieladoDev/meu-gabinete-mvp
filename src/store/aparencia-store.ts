import { create } from "zustand"

/**
 * O pedido de abrir o modal de APARÊNCIA (`layout/aparencia-menu.tsx`) de
 * fora dele (22/10/2026, pedido do Arthur): o item "Aparência" do menu do
 * usuário abre o MESMO modal do lápis do cabeçalho — havia uma seção de
 * Aparência nas Configurações também, e duas portas para a mesma escolha era
 * uma a mais.
 *
 * É um CONTADOR, não um booleano: quem abre é o próprio `AparenciaMenu`, que
 * monta o rascunho com o tema de agora antes de mostrar; aqui só se avisa que
 * alguém pediu.
 */
interface AparenciaState {
  pedido: number
  abrir: () => void
}

export const useAparenciaStore = create<AparenciaState>((set) => ({
  pedido: 0,
  abrir: () => set((s) => ({ pedido: s.pedido + 1 })),
}))
