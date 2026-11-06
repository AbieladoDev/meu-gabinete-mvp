"use client"

import * as React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TagPicker } from "@/components/common/tag-picker"
import { LinhasDeComposicao } from "@/components/gabinete/pecas"
import { MapaDeRespostas } from "@/components/gabinete/mapa-de-respostas"
import { porBairro } from "@/lib/geo"
import { useGabineteStore, useHidratado } from "@/store/gabinete-store"

export default function MapaPage() {
  const hidratado = useHidratado()
  const pesquisas = useGabineteStore((s) => s.pesquisas)
  const todas = useGabineteStore((s) => s.respostas)
  const [filtro, setFiltro] = React.useState("todas")

  const respostas = React.useMemo(
    () => (filtro === "todas" ? todas : todas.filter((r) => r.pesquisaId === filtro)),
    [todas, filtro]
  )
  const bairros = React.useMemo(() => porBairro(respostas), [respostas])

  return (
    <DashboardLayout
      title="Mapa"
      description="Cada ponto é uma pessoa que respondeu. Os círculos juntam quem mora perto; clique para aproximar."
      contagem={respostas.length}
      fill
      toolbar={
        <TagPicker
          label="Pesquisa"
          value={filtro}
          onChange={setFiltro}
          options={[{ value: "todas", label: "Todas" }, ...pesquisas.map((p) => ({ value: p.id, label: p.titulo }))]}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
        {hidratado && <MapaDeRespostas key={filtro} respostas={respostas} className="min-h-[400px] flex-1" />}
        <aside className="shrink-0 space-y-3 overflow-y-auto lg:w-72">
          <h3 className="text-sm font-semibold">Bairros com mais respostas</h3>
          <LinhasDeComposicao itens={bairros} limite={12} destaque="bg-violet-500" />
        </aside>
      </div>
    </DashboardLayout>
  )
}
