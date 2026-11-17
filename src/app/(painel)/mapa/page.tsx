"use client"

import * as React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TagPicker } from "@/components/common/tag-picker"
import { LinhasDeComposicao } from "@/components/gabinete/pecas"
import { MapaDeRespostas } from "@/components/gabinete/mapa-de-respostas"
import { useMinhaLocalizacao } from "@/hooks/use-minha-localizacao"
import { CADASTRO_DIRETO, distanciaKm, porBairro } from "@/lib/geo"
import { useGabineteStore, useHidratado } from "@/store/gabinete-store"

export default function MapaPage() {
  const hidratado = useHidratado()
  const pesquisas = useGabineteStore((s) => s.pesquisas)
  const todas = useGabineteStore((s) => s.respostas)
  const [filtro, setFiltro] = React.useState("todas")
  const eu = useMinhaLocalizacao()

  const respostas = React.useMemo(
    () =>
      filtro === "todas"
        ? todas
        : todas.filter((r) => (filtro === "direto" ? !r.pesquisaId : r.pesquisaId === filtro)),
    [todas, filtro]
  )
  const bairros = React.useMemo(() => porBairro(respostas), [respostas])

  // Quem abriu o painel em relação às pessoas do mapa: quantas estão perto e a mais próxima.
  const perto = React.useMemo(() => {
    if (!eu || respostas.length === 0) return null
    const distancias = respostas.map((r) => ({ r, km: distanciaKm(eu, r) })).sort((a, b) => a.km - b.km)
    return {
      em1km: distancias.filter((d) => d.km <= 1).length,
      em3km: distancias.filter((d) => d.km <= 3).length,
      maisProxima: distancias[0],
    }
  }, [eu, respostas])

  return (
    <DashboardLayout
      title="Mapa"
      description="Cada ponto azul é uma pessoa cadastrada; o laranja é você. Os círculos juntam quem mora perto; clique para aproximar."
      contagem={respostas.length}
      fill
      toolbar={
        <TagPicker
          label="Origem"
          value={filtro}
          onChange={setFiltro}
          options={[
            { value: "todas", label: "Todas" },
            ...pesquisas.map((p) => ({ value: p.id, label: p.titulo })),
            { value: "direto", label: CADASTRO_DIRETO },
          ]}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
        {hidratado && <MapaDeRespostas key={filtro} respostas={respostas} className="min-h-[400px] flex-1" />}
        <aside className="shrink-0 space-y-3 overflow-y-auto lg:w-72">
          {perto && (
            <div className="space-y-1 border-b pb-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                Perto de você
              </h3>
              <p className="text-sm">
                <span className="font-semibold tabular-nums">{perto.em1km}</span> a até 1 km ·{" "}
                <span className="font-semibold tabular-nums">{perto.em3km}</span> a até 3 km
              </p>
              <p className="text-xs text-muted-foreground">
                Mais próxima: {perto.maisProxima.r.nome}
                {perto.maisProxima.r.bairro ? `, ${perto.maisProxima.r.bairro}` : ""} ({formatarKm(perto.maisProxima.km)})
              </p>
            </div>
          )}
          <h3 className="text-sm font-semibold">Bairros com mais pessoas</h3>
          <LinhasDeComposicao itens={bairros} limite={12} destaque="bg-violet-500" />
        </aside>
      </div>
    </DashboardLayout>
  )
}

function formatarKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`
}
