import { create } from "zustand"

/**
 * As preferências DA PESSOA sobre a barra lateral (casca do todosDan,
 * 31/10/2026): os módulos que ela fixou no topo e os blocos que minimizou.
 *
 * ⚠️ **`localStorage`, não API.** São escolhas de conforto do dispositivo,
 * como o estado recolhido da barra e o tema.
 */

const CHAVE_FIXADOS = "painel-modulos-fixados"
const CHAVE_RECOLHIDOS = "painel-blocos-recolhidos"

function lerJson<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : padrao
  } catch {
    /* Storage bloqueado ou JSON antigo: começa do zero, sem quebrar a barra. */
    return padrao
  }
}

function gravarJson(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    /* Vale só nesta sessão. */
  }
}

interface BarraState {
  /** As URLs dos módulos fixados, na ordem em que foram fixados. */
  fixados: string[]
  /** Rótulos dos blocos minimizados ("Administração"...). */
  recolhidos: string[]
  /**
   * `false` até o efeito de hidratação rodar.
   *
   * ⚠️ O estado NÃO é lido do `localStorage` no valor inicial: o servidor não
   * tem storage, e o HTML viria diferente do cliente — erro de hidratação.
   */
  pronto: boolean

  hidratar: () => void
  alternarFixado: (url: string) => void
  alternarRecolhido: (bloco: string) => void
}

export const useBarraStore = create<BarraState>((set, get) => ({
  fixados: [],
  recolhidos: [],
  pronto: false,

  hidratar: () => {
    if (get().pronto) return
    set({
      fixados: lerJson<string[]>(CHAVE_FIXADOS, []),
      recolhidos: lerJson<string[]>(CHAVE_RECOLHIDOS, []),
      pronto: true,
    })
  },

  alternarFixado: (url) => {
    const atual = get().fixados
    const proximo = atual.includes(url)
      ? atual.filter((u) => u !== url)
      : [...atual, url]
    set({ fixados: proximo })
    gravarJson(CHAVE_FIXADOS, proximo)
  },

  alternarRecolhido: (bloco) => {
    const atual = get().recolhidos
    const proximo = atual.includes(bloco)
      ? atual.filter((b) => b !== bloco)
      : [...atual, bloco]
    set({ recolhidos: proximo })
    gravarJson(CHAVE_RECOLHIDOS, proximo)
  },
}))
