"use client"

import * as React from "react"
import MapLibreGL, { type GeoJSONSource } from "maplibre-gl"
import { useMap } from "@/components/ui/map"
import { PointFeatureCollection } from "@/lib/geo"

interface PontosLayerProps {
  data: PointFeatureCollection
  /** Mostra popup com nome/bairro ao clicar no ponto. So no mapa interno. */
  showPopup?: boolean
  /** Centro inicial [lng, lat] */
  center?: [number, number] | null
}

const SOURCE = "respostas"
const COLOR = "#2563eb" // azul fixo = informação

/**
 * Pontos agrupados (cluster) + camada de calor. O Map troca de style ao mudar
 * o tema, o que apaga source/layers — por isso o efeito refaz tudo a cada
 * isLoaded.
 */
export function PontosLayer({ data, showPopup = false, center }: PontosLayerProps) {
  const { map, isLoaded } = useMap()
  const centeredRef = React.useRef(false)

  React.useEffect(() => {
    if (!map || !isLoaded) return

    const existing = map.getSource(SOURCE) as GeoJSONSource | undefined
    if (existing) {
      existing.setData(data)
    } else {
      map.addSource(SOURCE, {
        type: "geojson",
        data,
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      })

      map.addLayer({
        id: "respostas-heat",
        type: "heatmap",
        source: SOURCE,
        maxzoom: 13,
        paint: {
          "heatmap-weight": ["case", ["has", "point_count"], ["min", ["/", ["get", "point_count"], 10], 1], 0.3],
          "heatmap-radius": 30,
          "heatmap-opacity": 0.6,
        },
      })

      map.addLayer({
        id: "respostas-clusters",
        type: "circle",
        source: SOURCE,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": COLOR,
          "circle-opacity": 0.85,
          "circle-radius": ["step", ["get", "point_count"], 14, 10, 20, 50, 28],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      })

      map.addLayer({
        id: "respostas-count",
        type: "symbol",
        source: SOURCE,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      })

      map.addLayer({
        id: "respostas-point",
        type: "circle",
        source: SOURCE,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": COLOR,
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      })
    }

    if (center && !centeredRef.current) {
      map.jumpTo({ center, zoom: 12 })
      centeredRef.current = true
    }

    async function onClusterClick(e: MapLibreGL.MapLayerMouseEvent) {
      const feature = e.features?.[0]
      if (!map || !feature) return
      const source = map.getSource(SOURCE) as GeoJSONSource
      const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id as number)
      map.easeTo({ center: (feature.geometry as GeoJSON.Point).coordinates as [number, number], zoom })
    }

    function onPointClick(e: MapLibreGL.MapLayerMouseEvent) {
      const feature = e.features?.[0]
      if (!map || !feature || !showPopup) return
      const { name, neighborhood, city } = feature.properties as Record<string, string>
      const place = [neighborhood, city].filter((v) => v && v !== "null").join(" · ")
      const el = document.createElement("div")
      const title = document.createElement("strong")
      title.textContent = name
      el.appendChild(title)
      if (place) {
        const sub = document.createElement("div")
        sub.textContent = place
        sub.style.fontSize = "12px"
        el.appendChild(sub)
      }
      new MapLibreGL.Popup({ closeButton: false })
        .setLngLat((feature.geometry as GeoJSON.Point).coordinates as [number, number])
        .setDOMContent(el)
        .addTo(map)
    }

    const pointer = () => { map.getCanvas().style.cursor = "pointer" }
    const reset = () => { map.getCanvas().style.cursor = "" }

    map.on("click", "respostas-clusters", onClusterClick)
    map.on("click", "respostas-point", onPointClick)
    map.on("mouseenter", "respostas-clusters", pointer)
    map.on("mouseleave", "respostas-clusters", reset)
    if (showPopup) {
      map.on("mouseenter", "respostas-point", pointer)
      map.on("mouseleave", "respostas-point", reset)
    }

    return () => {
      map.off("click", "respostas-clusters", onClusterClick)
      map.off("click", "respostas-point", onPointClick)
      map.off("mouseenter", "respostas-clusters", pointer)
      map.off("mouseleave", "respostas-clusters", reset)
      map.off("mouseenter", "respostas-point", pointer)
      map.off("mouseleave", "respostas-point", reset)
    }
  }, [map, isLoaded, data, showPopup, center])

  return null
}
