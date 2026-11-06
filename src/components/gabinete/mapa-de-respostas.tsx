"use client"

import * as React from "react"
import { Map, MapControls } from "@/components/ui/map"
import { PontosLayer } from "@/components/mapa/pontos-layer"
import type { Resposta } from "@/data/tipos"
import { centerOf, toPointCollection } from "@/lib/geo"
import { useGabineteStore } from "@/store/gabinete-store"
import { cn } from "@/lib/utils"

/** Mapa com clusters + calor das respostas. O pai define a altura. */
export function MapaDeRespostas({
  respostas,
  className,
  controles = true,
}: {
  respostas: Resposta[]
  className?: string
  controles?: boolean
}) {
  const pesquisas = useGabineteStore((s) => s.pesquisas)
  const centroGabinete = useGabineteStore((s) => s.gabinete.centro)
  const titulo = React.useMemo(() => Object.fromEntries(pesquisas.map((p) => [p.id, p.titulo])), [pesquisas])

  const data = React.useMemo(
    () =>
      toPointCollection(
        respostas.map((r) => ({
          latitude: r.latitude,
          longitude: r.longitude,
          properties: { name: r.nome, neighborhood: r.bairro, city: titulo[r.pesquisaId] ?? "" },
        }))
      ),
    [respostas, titulo]
  )
  const center = React.useMemo(() => centerOf(respostas) ?? centroGabinete, [respostas, centroGabinete])

  return (
    <div className={cn("relative overflow-hidden rounded-lg border", className)}>
      <Map center={centroGabinete} zoom={12}>
        {controles && <MapControls showZoom showFullscreen />}
        <PontosLayer data={data} center={center} showPopup />
      </Map>
    </div>
  )
}
