import type { Transition, Variants } from "framer-motion"

/**
 * O VOCABULÁRIO DE MOVIMENTO dos painéis — veio da TodosDan, ESPELHO de
 * `todosDan-app/src/lib/anim.ts` (22/10/2026, pedido do Arthur: "padronizar
 * essas animações, senão parecem projetos independentes — a mesma identidade
 * visual que temos nas logos, o código também tem que ter").
 *
 * ⚠️ **Mesma curva, mesmas durações, mesmo passo, mesmos nomes** que o app.
 * Mudou lá, muda aqui — e o contrário. É o que faz o cartão do painel e o do
 * app entrarem do mesmo jeito.
 *
 * ⚠️ **Toda animação daqui é decoração.** Nenhuma tela pode depender de um
 * `onAnimationComplete` para navegar ou gravar — quem tem
 * `prefers-reduced-motion` ligado não vê nada disso acontecer.
 *
 * Para usar sem montar `motion` à mão: `components/common/entrada.tsx`
 * (`Palco` + `Bloco`).
 */

/** `easeOutQuint`: sai rápido e assenta devagar. */
export const CURVA = [0.22, 1, 0.36, 1] as const

/** A tela que sai. Curta de propósito: o dedo já pediu para ir embora. */
export const SAIDA_MS = 240

/** A tela que chega. Mais longa — é ela que o olho acompanha. */
export const ENTRADA_S = 0.42

/** Atraso entre um filho e o seguinte na entrada escalonada. */
const PASSO_S = 0.06

export const TRANSICAO_ENTRADA: Transition = {
  duration: ENTRADA_S,
  ease: CURVA,
}

/**
 * O contêiner que escalona os filhos. `reduzido` desliga tudo: o estado final
 * é o mesmo, só chega instantâneo.
 */
export function palco(reduzido: boolean): Variants {
  return {
    oculto: {},
    visivel: {
      transition: reduzido
        ? { staggerChildren: 0 }
        : { staggerChildren: PASSO_S, delayChildren: 0.04 },
    },
  }
}

/** Um bloco entrando: sobe e aparece. */
export function bloco(reduzido: boolean): Variants {
  return {
    oculto: { opacity: 0, y: reduzido ? 0 : 18 },
    visivel: {
      opacity: 1,
      y: 0,
      transition: reduzido ? { duration: 0 } : TRANSICAO_ENTRADA,
    },
  }
}

/**
 * A TROCA no mesmo lugar: o que sai vai para CIMA e o que entra vem de BAIXO
 * — "o conteúdo avançou um passo". Invertido, lê como voltar.
 */
export function troca(reduzido: boolean): Variants {
  return {
    oculto: { opacity: 0, y: reduzido ? 0 : 14 },
    visivel: {
      opacity: 1,
      y: 0,
      transition: reduzido ? { duration: 0 } : TRANSICAO_ENTRADA,
    },
    saindo: reduzido
      ? { opacity: 0, transition: { duration: 0 } }
      : { opacity: 0, y: -14, transition: { duration: SAIDA_MS / 1000, ease: CURVA } },
  }
}

/**
 * O TOQUE num cartão — a resposta do dedo, a mesma do app
 * (`transition-opacity active:opacity-70`). Classe, não `motion`: é CSS puro e
 * não custa nada.
 */
export const TOQUE = "transition-opacity active:opacity-70"
