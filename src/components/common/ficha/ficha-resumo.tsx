import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface ItemDoResumo {
  key: string | number
  principal: React.ReactNode
  secundario?: React.ReactNode
  /** Canto direito: data/hora, valor, status. */
  canto?: React.ReactNode
  href?: string
}

/**
 * O pedaço de um MÓDULO dentro de uma ficha: os próximos/últimos poucos itens e
 * "ver todos", que abre o módulo JÁ FILTRADO (`/agenda?pessoa=12`).
 *
 * REGRA (03/11/2026): o dado mora no módulo; a ficha só resume e aponta. Nada se
 * edita aqui — quem quer trabalhar vai ao módulo.
 */
export function FichaResumo({
  itens,
  vazio,
  verTodos,
}: {
  itens: ItemDoResumo[]
  vazio: string
  verTodos?: { href: string; label?: string }
}) {
  return (
    <div>
      {itens.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <ul>
          {itens.map((item) => {
            const conteudo = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{item.principal}</span>
                  {item.secundario && (
                    <span className="block truncate text-xs text-muted-foreground">{item.secundario}</span>
                  )}
                </span>
                {item.canto && <span className="shrink-0 text-xs text-muted-foreground">{item.canto}</span>}
              </>
            )
            return (
              <li key={item.key} className="border-b last:border-b-0">
                {item.href ? (
                  <Link href={item.href} className="flex items-center gap-3 py-2.5 text-sm hover:text-primary">
                    {conteudo}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 py-2.5 text-sm">{conteudo}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {verTodos && (
        <Link href={verTodos.href} className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          {verTodos.label ?? "Ver todos"}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
