"use client"

import * as React from "react"
import { createPortal } from "react-dom"

/** Id do espaço à direita do conteúdo, criado pela casca (`DashboardShell`). */
export const PAGE_ASIDE_ID = "dashboard-aside"

/**
 * Coloca o conteúdo na coluna da direita da tela (abaixo do cabeçalho, até o
 * fim, ~40% no desktop; tela cheia no celular) — portado do degasBeer-admin.
 * É um portal: quem abre o painel continua dono do estado. Sem `PageAside`
 * montado, a coluna some (`empty:hidden` na casca). Uso típico: clicar na
 * linha da tabela abre `<PageAside><SidePanel …/></PageAside>`.
 */
export function PageAside({
  children,
  width,
}: {
  children: React.ReactNode
  /** Largura no desktop (padrão 40%). */
  width?: string
}) {
  const [target, setTarget] = React.useState<HTMLElement | null>(null)

  // O espaço é da casca: só existe no DOM depois da primeira montagem.
  React.useEffect(() => {
    setTarget(document.getElementById(PAGE_ASIDE_ID))
  }, [])

  // A largura vai numa variável CSS do espaço; sai quando o painel fecha.
  React.useEffect(() => {
    if (!target || !width) return
    target.style.setProperty("--page-aside-w", width)
    return () => {
      target.style.removeProperty("--page-aside-w")
    }
  }, [target, width])

  return target ? createPortal(children, target) : null
}
