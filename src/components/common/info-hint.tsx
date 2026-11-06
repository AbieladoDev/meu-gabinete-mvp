"use client"

import * as React from "react"
import { AlertTriangle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * INFORMAÇÃO e AVISO no painel são esta bolinha: o texto só aparece ao passar
 * o mouse (pedido do Arthur, 13/10/2026). Nada de faixa azul, parágrafo cinza
 * de explicação ou descrição embaixo do título — vira `InfoHint` ao lado do
 * rótulo a que se refere.
 *
 * `tone="warning"`: aviso (âmbar, triângulo). Erro de validação NÃO é aviso:
 * continua escrito embaixo do campo, porque precisa ser lido sem procurar.
 */
export function InfoHint({
  children,
  tone = "info",
  side = "top",
  className,
}: {
  /** O texto do tooltip. */
  children: React.ReactNode
  tone?: "info" | "warning"
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}) {
  const Icon = tone === "warning" ? AlertTriangle : Info
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={typeof children === "string" ? children : tone === "warning" ? "Aviso" : "Informação"}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full align-middle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            tone === "warning"
              ? "text-amber-500 hover:text-amber-600"
              : "text-muted-foreground/70 hover:text-foreground",
            className
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-72 text-pretty">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}
