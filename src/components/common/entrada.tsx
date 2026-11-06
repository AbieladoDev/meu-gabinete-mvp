"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { bloco, palco } from "@/lib/anim"

/**
 * A ENTRADA ESCALONADA dos cartões — `palco` + `bloco` de `lib/anim.ts` (o
 * vocabulário espelhado do app) sem montar `motion` à mão em cada tela.
 *
 * ```tsx
 * <Palco className="space-y-6">
 *   <Bloco>…cartão 1…</Bloco>
 *   <Bloco>…cartão 2…</Bloco>   ← entra 60ms depois, subindo
 * </Palco>
 * ```
 *
 * - `Palco` aninhado DENTRO de um `Bloco` escalona os filhos dele depois que o
 *   bloco entra (a lista de uma seção, por exemplo) — o framer propaga o
 *   estado pelas variantes.
 * - Movimento reduzido no aparelho = chega pronto, sem animar.
 * - ⚠️ Decoração: nada pode esperar a animação terminar.
 */
export function Palco({
  children,
  className,
  como = "div",
  aninhado = false,
}: {
  children: React.ReactNode
  className?: string
  /** `ul` quando os filhos são `li` (`Bloco como="li"`). */
  como?: "div" | "ul"
  /**
   * Dentro de um `Bloco`: NÃO dispara sozinho — herda o estado do pai e
   * escalona os filhos quando o bloco entra. Sem isto ele começaria junto
   * com a tela, e a lista não esperaria a seção aparecer.
   */
  aninhado?: boolean
}) {
  const reduzido = !!useReducedMotion()
  const Comp = como === "ul" ? motion.ul : motion.div
  return (
    <Comp
      className={className}
      variants={palco(reduzido)}
      {...(aninhado ? {} : { initial: "oculto", animate: "visivel" })}
    >
      {children}
    </Comp>
  )
}

export function Bloco({
  children,
  className,
  como = "div",
}: {
  children: React.ReactNode
  className?: string
  como?: "div" | "li" | "section"
}) {
  const reduzido = !!useReducedMotion()
  const Comp = como === "li" ? motion.li : como === "section" ? motion.section : motion.div
  return (
    <Comp className={className} variants={bloco(reduzido)}>
      {children}
    </Comp>
  )
}
