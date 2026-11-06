"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, ClipboardList, MapPinned, Plus, Users } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Indicador, LinhasDeComposicao, Pessoinha, tempoRelativo } from "@/components/gabinete/pecas"
import { MapaDeRespostas } from "@/components/gabinete/mapa-de-respostas"
import { porBairro, recentes } from "@/lib/geo"
import { useGabineteStore, useHidratado } from "@/store/gabinete-store"

export default function Inicio() {
  const hidratado = useHidratado()
  const gabinete = useGabineteStore((s) => s.gabinete)
  const pesquisas = useGabineteStore((s) => s.pesquisas)
  const respostas = useGabineteStore((s) => s.respostas)

  const semana = recentes(respostas, 7).length
  const semanaAnterior = recentes(respostas, 14).length - semana
  const variacao = semana - semanaAnterior
  const bairros = porBairro(respostas)
  const ativas = pesquisas.filter((p) => p.ativa).length
  const titulo = Object.fromEntries(pesquisas.map((p) => [p.id, p.titulo]))
  const primeiroNome = gabinete.vereador.split(" ")[0]

  return (
    <DashboardLayout
      title={`Olá, ${primeiroNome}`}
      description={`${gabinete.cargo} · ${gabinete.cidade}/${gabinete.uf}`}
      actions={
        <Button asChild>
          <Link href="/pesquisas?nova=1">
            <Plus className="h-4 w-4" />
            Nova pesquisa
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-b pb-5 lg:grid-cols-4">
          <Indicador
            icone={Users}
            cor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            rotulo="Pessoas ouvidas"
            valor={respostas.length}
          />
          <Indicador
            icone={CalendarDays}
            cor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            rotulo="Últimos 7 dias"
            valor={semana}
            detalhe={
              <span className={variacao >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                {variacao >= 0 ? "▲" : "▼"} {Math.abs(variacao)} vs. semana anterior
              </span>
            }
          />
          <Indicador
            icone={MapPinned}
            cor="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            rotulo="Bairros alcançados"
            valor={bairros.length}
            detalhe={bairros[0] ? `mais: ${bairros[0].rotulo}` : undefined}
          />
          <Indicador
            icone={ClipboardList}
            cor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            rotulo="Pesquisas recebendo"
            valor={ativas}
            detalhe={`de ${pesquisas.length} criadas`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Onde estão as respostas</h3>
              <Link href="/mapa" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                Abrir mapa <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {hidratado && <MapaDeRespostas respostas={respostas} className="h-[380px]" />}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Bairros com mais respostas</h3>
            <LinhasDeComposicao itens={bairros} limite={7} destaque="bg-violet-500" />
          </section>
        </div>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Chegou agora</h3>
            <Link href="/pessoas" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y">
            {respostas.slice(0, 6).map((r) => (
              <li key={r.id}>
                <Link href={`/pessoas?id=${r.id}`} className="flex items-center gap-3 py-2.5 hover:bg-muted/40">
                  <Pessoinha nome={r.nome} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.bairro} · {titulo[r.pesquisaId]}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{tempoRelativo(r.criadaEm)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  )
}
