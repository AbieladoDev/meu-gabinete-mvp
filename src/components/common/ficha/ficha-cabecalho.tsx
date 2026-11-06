import * as React from "react"

/**
 * Faixa do topo de uma FICHA (pessoa, cliente, produto): foto à esquerda,
 * quem é ao lado (título, subtítulo, etiquetas), dados de canto à direita e as
 * ações. No celular, centrada e empilhada. Mesmo desenho do cabeçalho do Meu perfil.
 */
export function FichaCabecalho({
  midia,
  titulo,
  subtitulo,
  etiquetas,
  canto,
  acoes,
}: {
  /** Foto/avatar (a ficha decide o tamanho). */
  midia?: React.ReactNode
  titulo: string
  subtitulo?: React.ReactNode
  /** Linha de etiquetas (cargo, "Sem acesso", status). */
  etiquetas?: React.ReactNode
  /** Informação de canto: "Último acesso", "Cliente desde". */
  canto?: React.ReactNode
  /** Botões (Editar, Desligar acesso, Excluir). */
  acoes?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-muted/50 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
      {midia}
      <div className="min-w-0 max-w-full flex-1">
        <h2 className="truncate text-xl font-semibold">{titulo}</h2>
        {subtitulo && <p className="truncate text-sm text-muted-foreground">{subtitulo}</p>}
        {etiquetas && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">{etiquetas}</div>
        )}
      </div>
      {(canto || acoes) && (
        <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
          {canto && <div className="space-y-1 text-xs text-muted-foreground sm:text-right">{canto}</div>}
          {acoes && <div className="flex flex-wrap justify-center gap-2 sm:justify-end">{acoes}</div>}
        </div>
      )}
    </div>
  )
}

/** Etiqueta de ficha: `tom="destaque"` (cargo) ou `tom="aviso"` ("Sem acesso"). */
export function FichaEtiqueta({ children, tom = "destaque" }: { children: React.ReactNode; tom?: "destaque" | "aviso" | "neutro" }) {
  const cor = {
    destaque: "bg-primary/10 text-primary",
    aviso: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    neutro: "bg-muted text-muted-foreground",
  }[tom]
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cor}`}>{children}</span>
}
