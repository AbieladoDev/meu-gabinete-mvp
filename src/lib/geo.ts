/**
 * Lógica pura do mapa e das pesquisas (coberta por `geo.test.ts`).
 * `toPointCollection`, `centerOf` e as máscaras vieram do `meugabinete-admin`.
 */
import type { Pergunta, Resposta } from "@/data/tipos"

export interface PointFeatureCollection {
  type: "FeatureCollection"
  features: {
    type: "Feature"
    properties: Record<string, string | number | null>
    geometry: { type: "Point"; coordinates: [number, number] }
  }[]
}

/** Converte [lat, lng] (+ propriedades) em GeoJSON — GeoJSON usa [lng, lat]. */
export function toPointCollection(
  points: { latitude: number; longitude: number; properties?: Record<string, string | number | null> }[]
): PointFeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      properties: p.properties ?? {},
      geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
    })),
  }
}

/** Centro médio dos pontos; null se não houver ponto. */
export function centerOf(points: { latitude: number; longitude: number }[]): [number, number] | null {
  if (points.length === 0) return null
  const lat = points.reduce((s, p) => s + p.latitude, 0) / points.length
  const lng = points.reduce((s, p) => s + p.longitude, 0) / points.length
  return [lng, lat]
}

/** Máscara de CEP: 93210000 -> 93210-000 */
export function formatZipCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

/** Máscara de telefone: 51999998888 -> (51) 99999-8888 ; 5133334444 -> (51) 3333-4444 */
export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  const split = d.length === 11 ? 7 : 6
  if (d.length <= split) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`
}

export interface Contagem {
  rotulo: string
  total: number
  /** 0–100, arredondado */
  percentual: number
}

/** Quantas respostas por bairro, do maior para o menor. */
export function porBairro(respostas: Pick<Resposta, "bairro">[]): Contagem[] {
  return contar(respostas.map((r) => r.bairro.trim() || "Sem bairro"))
}

/**
 * Resultado de uma pergunta de escolha: TODAS as opções aparecem (inclusive
 * com zero), na ordem em que foram cadastradas. Resposta com opção que não
 * existe mais (pesquisa editada depois) entra no fim.
 */
export function resultadoDaPergunta(pergunta: Pergunta, respostas: Pick<Resposta, "respostas">[]): Contagem[] {
  const valores = respostas.map((r) => r.respostas[pergunta.id]).filter((v): v is string => !!v)
  const total = valores.length
  const mapa = new Map<string, number>(pergunta.opcoes.map((o) => [o, 0]))
  for (const v of valores) mapa.set(v, (mapa.get(v) ?? 0) + 1)
  return [...mapa.entries()].map(([rotulo, n]) => ({
    rotulo,
    total: n,
    percentual: total ? Math.round((n / total) * 100) : 0,
  }))
}

function contar(valores: string[]): Contagem[] {
  const mapa = new Map<string, number>()
  for (const v of valores) mapa.set(v, (mapa.get(v) ?? 0) + 1)
  const total = valores.length
  return [...mapa.entries()]
    .map(([rotulo, n]) => ({ rotulo, total: n, percentual: total ? Math.round((n / total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo))
}

/** Normaliza para busca: sem acento, minúsculo. */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
}

/** Respostas dos últimos `dias` dias (a partir de `agora`). */
export function recentes<T extends { criadaEm: string }>(lista: T[], dias: number, agora = new Date()): T[] {
  const limite = agora.getTime() - dias * 24 * 60 * 60 * 1000
  return lista.filter((r) => new Date(r.criadaEm).getTime() >= limite)
}
