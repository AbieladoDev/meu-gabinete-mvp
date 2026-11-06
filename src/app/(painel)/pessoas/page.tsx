"use client"

import * as React from "react"
import Link from "next/link"
import { HandHelping, MessageCircle, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageAside } from "@/components/layout/page-aside"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { InfoHint } from "@/components/common/info-hint"
import { PanelFact, PanelFacts, SidePanel } from "@/components/common/side-panel"
import { TagPicker } from "@/components/common/tag-picker"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pessoinha, tempoRelativo } from "@/components/gabinete/pecas"
import { MapaDeRespostas } from "@/components/gabinete/mapa-de-respostas"
import { AtuacaoFormModal, LinhaAtuacao } from "@/components/gabinete/atuacoes"
import type { Atuacao, Resposta } from "@/data/tipos"
import { formatDateTime } from "@/lib/format"
import { normalizar } from "@/lib/geo"
import { useGabineteStore } from "@/store/gabinete-store"

const POR_PAGINA = 50

export default function PessoasPage() {
  const pesquisas = useGabineteStore((s) => s.pesquisas)
  const todas = useGabineteStore((s) => s.respostas)
  const excluirResposta = useGabineteStore((s) => s.excluirResposta)
  const atuacoes = useGabineteStore((s) => s.atuacoes)
  const [formAtuacao, setFormAtuacao] = React.useState<{ aberto: boolean; atuacao: Atuacao | null }>({ aberto: false, atuacao: null })
  const atuacoesPorPessoa = React.useMemo(() => {
    const m: Record<string, Atuacao[]> = {}
    for (const a of atuacoes) (m[a.pessoaId] ??= []).push(a)
    return m
  }, [atuacoes])

  const [busca, setBusca] = React.useState("")
  const [filtro, setFiltro] = React.useState("todas")
  const [abertaId, setAbertaId] = React.useState<string | null>(null)
  const [excluindo, setExcluindo] = React.useState<Resposta | null>(null)
  const [limite, setLimite] = React.useState(POR_PAGINA)

  // ?pesquisa=<id> (vem da ficha da pesquisa) e ?id=<resposta> (vem da busca)
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get("pesquisa")) setFiltro(q.get("pesquisa")!)
    if (q.get("id")) setAbertaId(q.get("id"))
  }, [])

  const titulo = React.useMemo(() => Object.fromEntries(pesquisas.map((p) => [p.id, p.titulo])), [pesquisas])
  const lista = React.useMemo(() => {
    const q = normalizar(busca)
    return todas.filter(
      (r) =>
        (filtro === "todas" || r.pesquisaId === filtro) &&
        (!q || normalizar(`${r.nome} ${r.bairro} ${r.rua} ${r.telefone}`).includes(q))
    )
  }, [todas, filtro, busca])

  const aberta = todas.find((r) => r.id === abertaId) ?? null

  return (
    <DashboardLayout
      title="Pessoas"
      description="Quem respondeu às pesquisas. Clique numa linha para ver as respostas e o endereço."
      contagem={lista.length}
      toolbar={
        <div className="flex w-full flex-wrap items-center gap-2">
          <TagPicker
            label="Pesquisa"
            value={filtro}
            onChange={setFiltro}
            options={[{ value: "todas", label: "Todas" }, ...pesquisas.map((p) => ({ value: p.id, label: p.titulo }))]}
          />
          <SearchInput value={busca} onChange={setBusca} placeholder="Nome, bairro, rua ou telefone" className="ml-auto" />
        </div>
      }
    >
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pessoa</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead className="hidden md:table-cell">Pesquisa</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Quando</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.slice(0, limite).map((r) => (
              <TableRow
                key={r.id}
                data-state={r.id === abertaId ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => setAbertaId(r.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Pessoinha nome={r.nome} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-medium">
                        {r.nome}
                        {atuacoesPorPessoa[r.id] && (
                          <span
                            title="Atuações do gabinete"
                            className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
                          >
                            <HandHelping className="h-3 w-3" />
                            {atuacoesPorPessoa[r.id].length}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{r.telefone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p>{r.bairro || "—"}</p>
                  <p className="text-xs text-muted-foreground">{r.rua}</p>
                </TableCell>
                <TableCell className="hidden text-sm md:table-cell">{titulo[r.pesquisaId]}</TableCell>
                <TableCell className="hidden text-right text-sm text-muted-foreground lg:table-cell">
                  {tempoRelativo(r.criadaEm)}
                </TableCell>
              </TableRow>
            ))}
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Ninguém encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {lista.length > limite && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" size="sm" onClick={() => setLimite((l) => l + POR_PAGINA)}>
            Mostrar mais ({lista.length - limite})
          </Button>
        </div>
      )}

      {aberta && (
        <PageAside>
          <SidePanel
            media={<Pessoinha nome={aberta.nome} />}
            title={aberta.nome}
            subtitle={titulo[aberta.pesquisaId]}
            onClose={() => setAbertaId(null)}
            footer={
              <>
                <Button variant="destructive" size="sm" onClick={() => setExcluindo(aberta)}>
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
                <Button size="sm" asChild>
                  <a href={`https://wa.me/55${aberta.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              </>
            }
          >
            <PanelFacts>
              <PanelFact label="Telefone" value={aberta.telefone || "—"} />
              <PanelFact label="Respondeu em" value={formatDateTime(aberta.criadaEm)} />
              <PanelFact label="Endereço" value={`${aberta.rua}${aberta.numero ? `, ${aberta.numero}` : ""}`} hint={aberta.cep} />
              <PanelFact label="Bairro" value={aberta.bairro || "—"} hint={`${aberta.cidade}/${aberta.uf}`} />
            </PanelFacts>

            <section className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Histórico de atuações
                  <span className="ml-1.5 font-normal text-muted-foreground">{atuacoesPorPessoa[aberta.id]?.length ?? 0}</span>
                </p>
                <Button variant="outline" size="sm" onClick={() => setFormAtuacao({ aberto: true, atuacao: null })}>
                  <Plus className="h-4 w-4" />
                  Registrar
                </Button>
              </div>
              {atuacoesPorPessoa[aberta.id]?.length ? (
                <div className="divide-y">
                  {atuacoesPorPessoa[aberta.id].slice(0, 5).map((a) => (
                    <LinhaAtuacao key={a.id} atuacao={a} onClick={() => setFormAtuacao({ aberto: true, atuacao: a })} />
                  ))}
                </div>
              ) : (
                <p className="py-2 text-sm text-muted-foreground">O gabinete ainda não registrou nada para esta pessoa.</p>
              )}
              {(atuacoesPorPessoa[aberta.id]?.length ?? 0) > 5 && (
                <Link href={`/atuacoes?pessoa=${aberta.id}`} className="text-xs text-muted-foreground underline">
                  Ver todas
                </Link>
              )}
            </section>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Respostas da pesquisa</p>
              {(pesquisas.find((p) => p.id === aberta.pesquisaId)?.perguntas ?? []).map((q) => (
                <div key={q.id}>
                  <p className="text-xs text-muted-foreground">{q.texto}</p>
                  <p className="text-sm font-medium">{aberta.respostas[q.id] || "—"}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                No mapa
                {aberta.aproximado && (
                  <InfoHint tone="warning">O endereço exato não foi encontrado; o ponto está no bairro.</InfoHint>
                )}
              </p>
              <MapaDeRespostas key={aberta.id} respostas={[aberta]} controles={false} className="h-56" />
            </div>
          </SidePanel>
        </PageAside>
      )}

      <AtuacaoFormModal
        open={formAtuacao.aberto}
        atuacao={formAtuacao.atuacao}
        pessoaId={aberta?.id ?? null}
        onOpenChange={(aberto) => setFormAtuacao((f) => ({ ...f, aberto }))}
      />
      <ConfirmDeleteDialog
        open={!!excluindo}
        onOpenChange={(o) => !o && setExcluindo(null)}
        title="Excluir resposta"
        subject="a resposta de"
        itemName={excluindo?.nome ?? ""}
        onConfirm={() => {
          if (excluindo) excluirResposta(excluindo.id)
          toast.success("Resposta excluída")
          setExcluindo(null)
          setAbertaId(null)
        }}
      />
    </DashboardLayout>
  )
}
