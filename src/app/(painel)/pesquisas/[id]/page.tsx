"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CalendarDays, ExternalLink, MapPinned, MessageSquareText, Pencil, Users } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BotaoCopiarLink,
  Indicador,
  LinhasDeComposicao,
  Pessoinha,
  SituacaoPesquisa,
  linkDaPesquisa,
  tempoRelativo,
} from "@/components/gabinete/pecas"
import { MapaDeRespostas } from "@/components/gabinete/mapa-de-respostas"
import { PesquisaFormModal } from "@/components/gabinete/pesquisa-form-modal"
import { porBairro, recentes, resultadoDaPergunta } from "@/lib/geo"
import { useGabineteStore, useHidratado } from "@/store/gabinete-store"

export default function PesquisaFichaPage() {
  const { id } = useParams<{ id: string }>()
  const hidratado = useHidratado()
  const pesquisa = useGabineteStore((s) => s.pesquisas.find((p) => p.id === id))
  const todas = useGabineteStore((s) => s.respostas)
  const respostas = React.useMemo(() => todas.filter((r) => r.pesquisaId === id), [todas, id])
  const [editando, setEditando] = React.useState(false)
  const [link, setLink] = React.useState("")
  React.useEffect(() => setLink(linkDaPesquisa(id)), [id])

  if (!hidratado) return null
  if (!pesquisa) {
    return (
      <DashboardLayout title="Pesquisa não encontrada">
        <p className="py-10 text-center text-sm text-muted-foreground">
          Essa pesquisa foi excluída. <Link href="/pesquisas" className="underline">Voltar para Pesquisas</Link>
        </p>
      </DashboardLayout>
    )
  }

  const bairros = porBairro(respostas)
  const semana = recentes(respostas, 7).length
  const escolhas = pesquisa.perguntas.filter((p) => p.tipo === "escolha")
  const textos = pesquisa.perguntas.filter((p) => p.tipo === "texto")
  const comentarios = textos
    .flatMap((q) => respostas.filter((r) => r.respostas[q.id]?.trim()).map((r) => ({ r, texto: r.respostas[q.id] })))
    .slice(0, 8)

  return (
    <DashboardLayout
      title={pesquisa.titulo}
      description={pesquisa.descricao || undefined}
      actions={
        <>
          <Button variant="outline" onClick={() => setEditando(true)}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button asChild>
            <Link href={`/f/${pesquisa.id}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Abrir formulário
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Link para mandar */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <SituacaoPesquisa ativa={pesquisa.ativa} />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Input readOnly value={link} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
            <BotaoCopiarLink id={pesquisa.id} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-y py-4 lg:grid-cols-4">
          <Indicador icone={Users} cor="bg-blue-500/10 text-blue-600 dark:text-blue-400" rotulo="Respostas" valor={respostas.length} />
          <Indicador
            icone={CalendarDays}
            cor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            rotulo="Últimos 7 dias"
            valor={semana}
            detalhe={respostas[0] ? `última ${tempoRelativo(respostas[0].criadaEm)}` : undefined}
          />
          <Indicador
            icone={MapPinned}
            cor="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            rotulo="Bairros alcançados"
            valor={bairros.length}
            detalhe={bairros[0] ? `mais: ${bairros[0].rotulo}` : undefined}
          />
          <Indicador
            icone={MessageSquareText}
            cor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            rotulo="Comentários"
            valor={comentarios.length}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-8">
            {escolhas.map((q) => (
              <section key={q.id} className="space-y-3">
                <h3 className="text-sm font-semibold">{q.texto}</h3>
                <LinhasDeComposicao itens={resultadoDaPergunta(q, respostas)} />
              </section>
            ))}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Respostas por bairro</h3>
              <LinhasDeComposicao itens={bairros} limite={8} destaque="bg-violet-500" />
            </section>
          </div>

          <div className="space-y-6">
            <MapaDeRespostas respostas={respostas} className="h-[420px]" />
            {comentarios.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">O que estão dizendo</h3>
                <ul className="divide-y">
                  {comentarios.map(({ r, texto }) => (
                    <li key={r.id + texto} className="flex gap-3 py-2.5">
                      <Pessoinha nome={r.nome} />
                      <div className="min-w-0">
                        <p className="text-sm">{texto}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.nome} · {r.bairro} · {tempoRelativo(r.criadaEm)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pessoas?pesquisa=${pesquisa.id}`}>Ver todas as pessoas desta pesquisa</Link>
            </Button>
          </div>
        </div>
      </div>

      <PesquisaFormModal open={editando} onOpenChange={setEditando} pesquisa={pesquisa} />
    </DashboardLayout>
  )
}
