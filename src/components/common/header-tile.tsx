"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Botão de ação do cabeçalho da página (prop `actions` do `DashboardLayout`):
 * REDONDO, só o ícone; o nome aparece ao passar o mouse (tooltip). Portado do
 * degasBeer-admin (pedido do Arthur, 08/10). Aceita ser gatilho de menu
 * (`DropdownMenuTrigger asChild`).
 */
export function HeaderTile({
  icon: Icon,
  label,
  tone = "primary",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  icon: LucideIcon
  label: string
  /** "neutral": fundo cinza e ícone preto. */
  tone?: "primary" | "neutral"
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          {...props}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            tone === "neutral"
              ? "border-border bg-muted text-foreground hover:bg-muted/70"
              : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15",
            className
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}
