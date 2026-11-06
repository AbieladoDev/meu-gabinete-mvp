/**
 * CEP → endereço (ViaCEP) e endereço → coordenada (Nominatim/OpenStreetMap),
 * direto do navegador — o MVP não tem API. Mesmos serviços do
 * `meugabinete-api` (`src/address/`).
 *
 * ⚠️ O Nominatim público aceita ~1 pedido/s e não serve para volume. No
 * sistema de verdade isso volta para a API (com cache), como no meugabinete-api.
 */

export interface EnderecoCep {
  rua: string
  bairro: string
  cidade: string
  uf: string
}

export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const digitos = cep.replace(/\D/g, "")
  if (digitos.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.erro) return null
    return {
      rua: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      uf: data.uf ?? "",
    }
  } catch {
    return null
  }
}

export interface Coordenada {
  latitude: number
  longitude: number
}

async function nominatim(consulta: string): Promise<Coordenada | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(consulta)}`,
      { headers: { "Accept-Language": "pt-BR" } }
    )
    if (!res.ok) return null
    const lista: { lat: string; lon: string }[] = await res.json()
    if (!lista.length) return null
    return { latitude: parseFloat(lista[0].lat), longitude: parseFloat(lista[0].lon) }
  } catch {
    return null
  }
}

/**
 * Tenta do mais exato para o menos: rua + número → rua → bairro → cidade.
 * `aproximado` = não achou a rua; o ponto caiu no bairro ou na cidade.
 * Sem nada (offline, serviço fora), devolve null e quem chama usa o centro do gabinete.
 */
export async function geocodificar(e: {
  rua: string
  numero: string
  bairro: string
  cidade: string
  uf: string
}): Promise<(Coordenada & { aproximado: boolean }) | null> {
  const local = [e.cidade, e.uf, "Brasil"].filter(Boolean).join(", ")
  const tentativas: [string, boolean][] = []
  if (e.rua && e.numero) tentativas.push([`${e.rua}, ${e.numero}, ${local}`, false])
  if (e.rua) tentativas.push([`${e.rua}, ${local}`, false])
  if (e.bairro) tentativas.push([`${e.bairro}, ${local}`, true])
  if (e.cidade) tentativas.push([local, true])

  for (const [consulta, aproximado] of tentativas) {
    const c = await nominatim(consulta)
    if (c) return { ...c, aproximado }
  }
  return null
}

/** Espalha um pouco (~150 m) quem caiu no mesmo ponto aproximado, para não virar um ponto só. */
export function espalhar(c: Coordenada): Coordenada {
  return {
    latitude: c.latitude + (Math.random() - 0.5) * 0.003,
    longitude: c.longitude + (Math.random() - 0.5) * 0.003,
  }
}
