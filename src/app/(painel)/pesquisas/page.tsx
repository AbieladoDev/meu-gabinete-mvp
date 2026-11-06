"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, MoreHorizontal, Pencil, Plus, Power, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BotaoCopiarLink, SituacaoPesquisa, tempoRelativo } from "@/components/gabinete/pecas"
import { PesquisaFormModal } from "@/components/gabinete/pesquisa-form-modal"
import type { Pesquisa } from "@/data/tipos"
import { normalizar, recentes } from "@/lib/geo"
import { useGabineteStore } from "@/store/gabinete-store"

export default function PesquisasPage() {
  const router = useRouter()
  const pesquisas = useGabineteStore((s) => s.pesquisas)
  const respostas = useGabineteStore((s) => s.respostas)
  const alternarPesquisa = useGabineteStore((s) => s.alternarPesquisa)
  const excluirPesquisa = useGabineteStore((s) => s.excluirPesquisa)

  const [busca, setBusca] = React.useState("")
  const [form, setForm] = React.useState<{ aberto: boolean; pesquisa: Pesquisa | null }>({ aberto: false, pesquisa: null })
  const [excluindo, setExcluindo] = React.useState<Pesquisa | null>(null)

  // Atalho "Nova pesquisa" do + e da busca: /pesquisas?nova=1 (sem useSearchParams, que exigiria Suspense no build)
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get("nova") === "1") {
      setForm({ aberto: true, pesquisa: null })
      window.history.replaceState(null, "", "/pesquisas")
    }
  }, [])

  const porPesquisa = React.useMemo(() => {
    const m: Record<string, { total: number; semana: number; ultima?: string }> = {}
    const semana = new Set(recentes(respostas, 7).map((r) => r.id))
    for (const r of respostas) {
      const c = (m[r.pesquisaId] ??= { total: 0, semana: 0 })
      c.total++
      if (semana.has(r.id)) c.semana++
      if (!c.ultima || r.criadaEm > c.ultima) c.ultima = r.criadaEm
    }
    return m
  }, [respostas])

  const lista = pesquisas.filter((p) => normalizar(p.titulo).includes(normalizar(busca)))

  return (
    <DashboardLayout
      title="Pesquisas"
      description="Cada pesquisa tem um link. Mande no WhatsApp: quem responde informa CEP e rua e aparece no mapa."
      contagem={pesquisas.length}
      actions={
        <Button onClick={() => setForm({ aberto: true, pesquisa: null })}>
          <Plus className="h-4 w-4" />
          Nova pesquisa
        </Button>
      }
      toolbar={<SearchInput value={busca} onChange={setBusca} placeholder="Buscar pesquisa" />}
    >
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pesquisa</TableHead>
              <TableHead className="hidden md:table-cell">Situação</TableHead>
              <TableHead className="text-right">Respostas</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Última</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((p) => {
              const c = porPesquisa[p.id]
              return (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/pesquisas/${p.id}`)}>
                  <TableCell>
                    <p className="font-medium">{p.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.perguntas.length} {p.perguntas.length === 1 ? "pergunta" : "perguntas"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <SituacaoPesquisa ativa={p.ativa} />
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="font-semibold tabular-nums">{c?.total ?? 0}</p>
                    {!!c?.semana && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">▲ {c.semana} na semana</p>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground lg:table-cell">
                    {c?.ultima ? tempoRelativo(c.ultima) : "—"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <BotaoCopiarLink id={p.id} compacto />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Mais ações">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => window.open(`/f/${p.id}`, "_blank")}>
                            <ExternalLink className="h-4 w-4" /> Abrir formulário
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setForm({ aberto: true, pesquisa: p })}>
                            <Pencil className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              alternarPesquisa(p.id)
                              toast.success(p.ativa ? "Pesquisa encerrada" : "Pesquisa reaberta")
                            }}
                          >
                            <Power className="h-4 w-4" /> {p.ativa ? "Encerrar" : "Reabrir"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onSelect={() => setExcluindo(p)}>
                            <Trash2 className="h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  {busca ? "Nenhuma pesquisa com esse nome." : "Nenhuma pesquisa ainda. Crie a primeira."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PesquisaFormModal
        open={form.aberto}
        pesquisa={form.pesquisa}
        onOpenChange={(aberto) => setForm((f) => ({ ...f, aberto }))}
        onSalva={(p) => {
          if (!form.pesquisa) router.push(`/pesquisas/${p.id}`)
        }}
      />
      <ConfirmDeleteDialog
        open={!!excluindo}
        onOpenChange={(o) => !o && setExcluindo(null)}
        title="Excluir pesquisa"
        subject="a pesquisa"
        itemName={`${excluindo?.titulo ?? ""} (e as ${excluindo ? (porPesquisa[excluindo.id]?.total ?? 0) : 0} respostas dela)`}
        onConfirm={() => {
          if (excluindo) excluirPesquisa(excluindo.id)
          toast.success("Pesquisa excluída")
          setExcluindo(null)
        }}
      />
    </DashboardLayout>
  )
}
