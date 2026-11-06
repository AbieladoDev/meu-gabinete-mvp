"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

/** Uma curva só para tudo — desacelera no fim, sem passar do ponto. */
const EASE = [0.22, 1, 0.36, 1] as const

/** Espaço entre a bolinha e o nome, em px — entra na conta do deslocamento. */
const GAP = 24

/** Carrega a foto ANTES de começar; teto de 600ms para rede lenta não prender a tela. */
function preloadImage(src: string | null): Promise<void> {
  if (!src) return Promise.resolve()
  return Promise.race([
    new Promise<void>((ok) => {
      const img = new Image()
      img.onload = img.onerror = () => ok()
      img.src = src
    }),
    new Promise<void>((ok) => setTimeout(ok, 600)),
  ])
}

/**
 * Boas-vindas e tchau, no movimento do degasBeer-admin (login do Xbox One):
 * a tela cobre, a bolinha do perfil aparece no meio com um anel girando,
 * desliza para o lado e entra "Bem-vindo de volta" / "Até logo" com o nome.
 *
 * ⚠️ Sem `layout` do framer-motion e sem mola (era a "tremida" no todosDan):
 * a linha já nasce com o nome dentro (invisível), a largura do lado direito é
 * medida uma vez e o deslizar é um `translateX` com curva sem rebote.
 *
 * Linha do tempo: fundo cobre → `onCovered` → bolinha → nome → conteúdo sai →
 * `onContentGone` → a tela de baixo monta → fundo sai → `onDone`. Quem usa
 * navega em `onCovered` (entrada) ou `onContentGone` (saída) — nunca com o
 * fundo ainda translúcido, senão a tela nova aparece através dele.
 */
export function GreetingOverlay({
  name,
  avatarUrl,
  goodbye = false,
  onCovered,
  onContentGone,
  onDone,
}: {
  name: string
  avatarUrl: string | null
  /** Tchau: "Até logo" no lugar de "Bem-vindo de volta". */
  goodbye?: boolean
  onCovered?: () => void
  onContentGone?: () => void
  onDone: () => void
}) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = React.useState<
    "loading" | "avatar" | "name" | "leaving" | "background"
  >("loading")

  /* Quanto a linha anda para a BOLINHA ficar no centro enquanto o nome ainda
     não entrou: metade da largura do lado direito + o espaço entre eles. */
  const rightRef = React.useRef<HTMLDivElement>(null)
  const [offset, setOffset] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = rightRef.current
    if (el) setOffset((el.offsetWidth + GAP) / 2)
  }, [name])

  const callbacks = React.useRef({ onCovered, onContentGone, onDone })
  React.useEffect(() => {
    callbacks.current = { onCovered, onContentGone, onDone }
  })

  React.useEffect(() => {
    let alive = true
    const timers: ReturnType<typeof setTimeout>[] = []
    const k = reduceMotion ? 0.4 : 1
    const at = (ms: number, fn: () => void) =>
      timers.push(setTimeout(() => alive && fn(), ms * k))

    /* O fundo leva 450ms para cobrir; a foto carrega em paralelo. */
    const covered = new Promise<void>((ok) => setTimeout(ok, 450 * k))
    Promise.all([preloadImage(avatarUrl), covered]).then(() => {
      if (!alive) return
      callbacks.current.onCovered?.()
      setPhase("avatar")
      at(1100, () => setPhase("name"))
      at(3100, () => setPhase("leaving"))
      at(3500, () => callbacks.current.onContentGone?.())
      /* A tela de baixo monta enquanto o fundo ainda cobre — só então ele sai. */
      at(4200, () => setPhase("background"))
      at(4650, () => callbacks.current.onDone())
    })
    return () => {
      alive = false
      timers.forEach(clearTimeout)
    }
    // avatarUrl não muda durante a animação (o GreetingLayer troca a key a cada saudação)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion])

  const firstName = name.trim().split(" ")[0]
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
  const contentVisible = phase === "avatar" || phase === "name"
  const nameVisible = phase === "name" || phase === "leaving"

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "background" ? 0 : 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="flex items-center"
        style={{ gap: GAP }}
        initial={false}
        animate={{
          x: nameVisible ? 0 : offset,
          opacity: contentVisible ? 1 : 0,
          y: phase === "leaving" ? -6 : 0,
        }}
        transition={{
          x: { duration: 0.75, ease: EASE },
          opacity: { duration: 0.4, ease: EASE },
          y: { duration: 0.4, ease: EASE },
        }}
      >
        {/* A bolinha do perfil */}
        <motion.div
          className="relative h-24 w-24 shrink-0"
          initial={false}
          animate={{ scale: phase === "loading" ? 0.6 : 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {/* Anel que gira em volta enquanto "entra" */}
          <motion.span
            className="absolute -inset-1.5 rounded-full border-[3px] border-transparent border-t-primary border-r-primary/40"
            animate={{ rotate: 360, opacity: phase === "avatar" ? 1 : 0 }}
            transition={{
              rotate: { duration: 1.1, ease: "linear", repeat: Infinity },
              opacity: { duration: 0.3 },
            }}
          />
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary text-3xl font-semibold text-primary-foreground shadow-lg">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </motion.div>

        {/* O lado direito existe desde o início (para ser medido), invisível até a fase "name". */}
        <motion.div
          ref={rightRef}
          className="flex min-w-0 flex-col"
          initial={false}
          animate={{ opacity: nameVisible ? 1 : 0, x: nameVisible ? 0 : -16 }}
          transition={{ duration: 0.5, ease: EASE, delay: phase === "name" ? 0.2 : 0 }}
        >
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {goodbye ? "Até logo" : "Bem-vindo de volta"}
          </span>
          <span className="max-w-[22ch] truncate text-4xl font-semibold tracking-tight text-foreground">
            {firstName}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
