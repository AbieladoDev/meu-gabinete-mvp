"use client"

import * as React from "react"
import { Map, MapControls, MapMarker, MarkerContent } from "@/components/ui/map"
import { PontosLayer } from "@/components/mapa/pontos-layer"
import type { Resposta } from "@/data/tipos"
import { useMinhaLocalizacao } from "@/hooks/use-minha-localizacao"
import { CADASTRO_DIRETO, centerOf, toPointCollection } from "@/lib/geo"
import { useGabineteStore } from "@/store/gabinete-store"
import { cn } from "@/lib/utils"

/**
 * Mapa com clusters + calor das pessoas. O pai define a altura.
 * Com `controles`, mostra também onde está quem abriu o painel (ponto laranja
 * "Você") e o botão de ir até lá.
 */
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
  const eu = useMinhaLocalizacao(controles)

  const data = React.useMemo(
    () =>
      toPointCollection(
        respostas.map((r) => ({
          latitude: r.latitude,
          longitude: r.longitude,
          properties: { name: r.nome, neighborhood: r.bairro, city: titulo[r.pesquisaId] ?? CADASTRO_DIRETO },
        }))
      ),
    [respostas, titulo]
  )
  const center = React.useMemo(() => centerOf(respostas) ?? centroGabinete, [respostas, centroGabinete])

  return (
    <div className={cn("relative overflow-hidden rounded-lg border", className)}>
      <Map center={centroGabinete} zoom={12}>
        {controles && <MapControls showZoom showLocate showFullscreen />}
        <PontosLayer data={data} center={center} showPopup />
        {eu && (
          <MapMarker longitude={eu.longitude} latitude={eu.latitude} anchor="bottom">
            <MarkerContent className="flex cursor-default flex-col items-center">
              <span className="mb-1 rounded bg-orange-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                Você
              </span>
              <span className="h-4 w-4 rounded-full border-[3px] border-white bg-orange-500 shadow" />
            </MarkerContent>
          </MapMarker>
        )}
      </Map>
    </div>
  )
}
