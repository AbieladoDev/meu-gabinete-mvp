"use client"

import * as React from "react"

export interface MinhaLocalizacao {
  latitude: number
  longitude: number
}

/**
 * Onde está QUEM ABRIU o painel (GPS/Wi-Fi do aparelho, via navegador).
 * Pede a permissão uma vez por carregamento e reparte o resultado entre todos
 * os mapas da tela. Negou, sem GPS ou fora de HTTPS → fica `null` e o mapa
 * segue igual, sem o ponto "Você".
 */
let atual: MinhaLocalizacao | null = null
let pedido = false
const ouvintes = new Set<() => void>()

function pedir() {
  if (pedido || typeof navigator === "undefined" || !("geolocation" in navigator)) return
  pedido = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      atual = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
      ouvintes.forEach((avisar) => avisar())
    },
    () => {},
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  )
}

export function useMinhaLocalizacao(ativo = true): MinhaLocalizacao | null {
  React.useEffect(() => {
    if (ativo) pedir()
  }, [ativo])
  const valor = React.useSyncExternalStore(
    (avisar) => {
      ouvintes.add(avisar)
      return () => ouvintes.delete(avisar)
    },
    () => atual,
    () => null
  )
  return ativo ? valor : null
}
