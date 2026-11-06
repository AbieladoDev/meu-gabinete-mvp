import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Bloco de FICHA (Meu perfil, ficha da pessoa, ficha de cliente nos projetos):
 * título pequeno em caixa-alta e o conteúdo — sem card (preferência do
 * Arthur: card só no Financeiro). Mesmo desenho do `Bloco` de
 * `todosDan-client/src/components/settings/profile-blocos.tsx`.
 */
export function FichaBloco({
  titulo,
  acao,
  className,
  children,
}: {
  titulo: string
  /** Botão à direita do título (ex.: "Editar"). */
  acao?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("min-w-0 border-t py-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{titulo}</p>
        {acao}
      </div>
      {children}
    </section>
  )
}

/** Rótulo à esquerda, valor à direita. Usar dentro de um `<dl>`. */
export function FichaLinha({ rotulo, children }: { rotulo: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="flex shrink-0 items-center gap-1 text-muted-foreground">{rotulo}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  )
}
