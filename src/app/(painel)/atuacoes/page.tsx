"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, X } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TagPicker } from "@/components/common/tag-picker"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pessoinha } from "@/components/gabinete/pecas"
import { AtuacaoFormModal, IconeCategoria, SituacaoAtuacaoBadge } from "@/components/gabinete/atuacoes"
import type { Atuacao } from "@/data/tipos"
import { formatDay } from "@/lib/format"
import { normalizar } from "@/lib/geo"
import { useGabineteStore } from "@/store/gabinete-store"

/**
 * ATUAÇÕES — o que o gabinete faz por cada pessoa. O dado mora aqui (regra do
 * template para módulo com pessoa); a ficha da pessoa mostra só o resumo e
 * aponta para cá com `?pessoa=<id>`.
 */
export default function AtuacoesPage() {
  const atuacoes = useGabineteStore((s) => s.atuacoes)
  const respostas = useGabineteStore((s) => s.respostas)

  const [busca, setBusca] = React.useState("")
  const [situacao, setSituacao] = React.useState("todas")
  const [pessoaId, setPessoaId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<{ aberto: boolean; atuacao: Atuacao | null }>({ aberto: false, atuacao: null })

  // ?pessoa=<id> (vem da ficha da pessoa) e ?nova=1 (atalho do +)
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get("pessoa")) setPessoaId(q.get("pessoa"))
    if (q.get("nova") === "1") {
      setForm({ aberto: true, atuacao: null })
      window.history.replaceState(null, "", "/atuacoes")
    }
  }, [])

  const pessoas = React.useMemo(() => Object.fromEntries(respostas.map((r) => [r.id, r])), [respostas])
  const pessoa = pessoaId ? pessoas[pessoaId] : null

  const lista = React.useMemo(() => {
    const q = normalizar(busca)
    return atuacoes.filter((a) => {
      if (pessoaId && a.pessoaId !== pessoaId) return false
      if (situacao !== "todas" && a.situacao !== situacao) return false
      const p = pessoas[a.pessoaId]
      return !q || normalizar(`${a.descricao} ${a.categoria} ${p?.nome ?? ""} ${p?.bairro ?? ""}`).includes(q)
    })
  }, [atuacoes, pessoas, pessoaId, situacao, busca])

  const andamento = atuacoes.filter((a) => a.situacao === "andamento").length

  return (
    <DashboardLayout
      title="Atuações"
      description="O que o gabinete fez por cada pessoa: encaminhamentos, pedidos à prefeitura, retornos."
      contagem={lista.length}
      actions={
        <Button onClick={() => setForm({ aberto: true, atuacao: null })}>
          <Plus className="h-4 w-4" />
          Registrar atuação
        </Button>
      }
      toolbar={
        <div className="flex w-full flex-wrap items-center gap-2">
          <TagPicker
            label="Situação"
            value={situacao}
            onChange={setSituacao}
            options={[
              { value: "todas", label: "Todas" },
              { value: "andamento", label: `Em andamento (${andamento})` },
              { value: "concluida", label: "Concluídas" },
            ]}
          />
          {pessoa && (
            <button
              type="button"
              onClick={() => {
                setPessoaId(null)
                window.history.replaceState(null, "", "/atuacoes")
              }}
              className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 text-sm hover:bg-muted"
            >
              <Pessoinha nome={pessoa.nome} className="h-6 w-6 text-[10px]" />
              {pessoa.nome}
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar atuação ou pessoa" className="ml-auto" />
        </div>
      }
    >
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atuação</TableHead>
              <TableHead>Pessoa</TableHead>
              <TableHead className="hidden md:table-cell">Situação</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((a) => {
              const p = pessoas[a.pessoaId]
              return (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => setForm({ aberto: true, atuacao: a })}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <IconeCategoria categoria={a.categoria} />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm">{a.descricao}</p>
                        <p className="text-xs text-muted-foreground">{a.categoria}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {p ? (
                      <Link href={`/pessoas?id=${p.id}`} className="flex items-center gap-2 hover:underline">
                        <Pessoinha nome={p.nome} className="h-7 w-7" />
                        <div className="min-w-0">
                          <p className="truncate text-sm">{p.nome}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.bairro}</p>
                        </div>
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <SituacaoAtuacaoBadge situacao={a.situacao} />
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground lg:table-cell">
                    {formatDay(a.data)}
                  </TableCell>
                </TableRow>
              )
            })}
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  {pessoa ? `Nenhuma atuação para ${pessoa.nome} ainda.` : "Nenhuma atuação encontrada."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AtuacaoFormModal
        open={form.aberto}
        atuacao={form.atuacao}
        pessoaId={form.atuacao ? null : pessoaId}
        onOpenChange={(aberto) => setForm((f) => ({ ...f, aberto }))}
      />
    </DashboardLayout>
  )
}
