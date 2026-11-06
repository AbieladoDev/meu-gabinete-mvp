"use client"

import * as React from "react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidePanelProps {
  /** Foto/ícone à esquerda do título. */
  media: React.ReactNode
  title: string
  subtitle?: string
  onClose: () => void
  /** Botões do rodapé (Editar, Excluir...). Sem eles, não há rodapé. */
  footer?: React.ReactNode
  /** Ainda carregando o item: mostra "Carregando..." no corpo. */
  isLoading?: boolean
  children?: React.ReactNode
}

/**
 * O "visualizar" ao clicar na linha da tabela, na coluna da direita (vai
 * dentro de `PageAside`) — portado do degasBeer-admin. Cabeçalho no MESMO
 * estilo do `FormModalHeader` (fino, um tom mais escuro, X com fundo); corpo
 * que rola; rodapé com as ações.
 */
export function SidePanel({ media, title, subtitle, onClose, footer, isLoading, children }: SidePanelProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-background">
      <div className="flex shrink-0 items-center gap-3 border-b bg-muted/60 px-4 py-2.5">
        {media}
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{title}</span>
          {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          aria-label="Fechar"
          className="h-7 w-7 shrink-0 rounded-full bg-background text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </div>
        ) : (
          children
        )}
      </div>

      {footer && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted/30 px-4 py-3">{footer}</div>
      )}
    </aside>
  )
}

/** Grade 2×2 de dados, com as linhas entre os blocos (gap-px sobre fundo de borda). */
export function PanelFacts({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border">{children}</div>
}

/** Um dado: rótulo em cima, valor embaixo, detalhe opcional. */
export function PanelFact({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  tone?: "warn"
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 bg-background px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("truncate text-sm font-semibold tabular-nums", tone === "warn" && "text-destructive")}>{value}</span>
      {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}
