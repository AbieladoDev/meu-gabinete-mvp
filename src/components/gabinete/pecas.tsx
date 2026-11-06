"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Contagem } from "@/lib/geo"
import { cn } from "@/lib/utils"

/** Cores das iniciais — fixas por nome, para a mesma pessoa ter sempre a mesma cor. */
const CORES = [
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
]

export function Pessoinha({ nome, className }: { nome: string; className?: string }) {
  const partes = nome.trim().split(/\s+/)
  const iniciais = ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase()
  let h = 0
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        CORES[h % CORES.length],
        className
      )}
    >
      {iniciais || "?"}
    </span>
  )
}

/**
 * Barra de COMPOSIÇÃO reta e grossa (a única barra que o Arthur aceita) com o
 * percentual em texto. Uma linha por opção.
 */
export function LinhasDeComposicao({
  itens,
  limite,
  destaque = "bg-blue-500",
}: {
  itens: Contagem[]
  limite?: number
  destaque?: string
}) {
  const lista = limite ? itens.slice(0, limite) : itens
  const maior = Math.max(1, ...lista.map((i) => i.total))
  if (lista.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
  }
  return (
    <div className="space-y-2.5">
      {lista.map((i, n) => (
        <div key={i.rotulo} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">{i.rotulo}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {i.total} <span className="text-xs">· {i.percentual}%</span>
            </span>
          </div>
          <div className="h-2.5 w-full bg-muted">
            <div
              className={cn("h-full", n === 0 && i.total > 0 ? destaque : "bg-foreground/25")}
              style={{ width: `${(i.total / maior) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Número grande com ícone colorido — faixa de indicadores SEM cartão em volta. */
export function Indicador({
  icone: Icone,
  cor,
  rotulo,
  valor,
  detalhe,
}: {
  icone: React.ElementType
  cor: string
  rotulo: string
  valor: React.ReactNode
  detalhe?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", cor)}>
        <Icone className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{rotulo}</p>
        <p className="text-xl font-semibold tabular-nums leading-tight">{valor}</p>
        {detalhe && <p className="truncate text-xs text-muted-foreground">{detalhe}</p>}
      </div>
    </div>
  )
}

export function SituacaoPesquisa({ ativa }: { ativa: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        ativa
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", ativa ? "bg-emerald-500" : "bg-zinc-400")} />
      {ativa ? "Recebendo respostas" : "Encerrada"}
    </span>
  )
}

export function linkDaPesquisa(id: string) {
  if (typeof window === "undefined") return `/f/${id}`
  return `${window.location.origin}/f/${id}`
}

export function BotaoCopiarLink({ id, compacto = false }: { id: string; compacto?: boolean }) {
  const [copiado, setCopiado] = React.useState(false)
  async function copiar(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(linkDaPesquisa(id))
      setCopiado(true)
      toast.success("Link copiado — é só mandar no WhatsApp")
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }
  const Icone = copiado ? Check : Copy
  return (
    <Button variant="outline" size={compacto ? "icon-sm" : "sm"} onClick={copiar} aria-label="Copiar link">
      <Icone className="h-4 w-4" />
      {!compacto && "Copiar link"}
    </Button>
  )
}

export function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return "agora"
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  if (d === 1) return "ontem"
  if (d < 30) return `há ${d} dias`
  return new Date(iso).toLocaleDateString("pt-BR")
}
