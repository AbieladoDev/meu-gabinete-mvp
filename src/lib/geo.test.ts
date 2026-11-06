import { describe, expect, it } from "vitest"

import type { Pergunta } from "@/data/tipos"
import { centerOf, formatPhone, formatZipCode, normalizar, porBairro, recentes, resultadoDaPergunta, toPointCollection } from "./geo"

describe("toPointCollection", () => {
  it("inverte para [lng, lat], que é a ordem do GeoJSON", () => {
    const fc = toPointCollection([{ latitude: -29.8, longitude: -51.1, properties: { name: "Ana" } }])
    expect(fc.features[0].geometry.coordinates).toEqual([-51.1, -29.8])
    expect(fc.features[0].properties).toEqual({ name: "Ana" })
  })
})

describe("centerOf", () => {
  it("é null sem pontos e a média com pontos", () => {
    expect(centerOf([])).toBeNull()
    expect(centerOf([
      { latitude: -10, longitude: -50 },
      { latitude: -20, longitude: -52 },
    ])).toEqual([-51, -15])
  })
})

describe("máscaras", () => {
  it("CEP", () => {
    expect(formatZipCode("93210000")).toBe("93210-000")
    expect(formatZipCode("932")).toBe("932")
    expect(formatZipCode("93210-000123")).toBe("93210-000")
  })
  it("telefone celular e fixo", () => {
    expect(formatPhone("51999998888")).toBe("(51) 99999-8888")
    expect(formatPhone("5133334444")).toBe("(51) 3333-4444")
  })
})

describe("porBairro", () => {
  it("conta, ordena do maior e junta bairro vazio em 'Sem bairro'", () => {
    const r = porBairro([{ bairro: "Centro" }, { bairro: "Vargas" }, { bairro: "Centro" }, { bairro: " " }])
    expect(r[0]).toEqual({ rotulo: "Centro", total: 2, percentual: 50 })
    expect(r.map((x) => x.rotulo)).toContain("Sem bairro")
  })
})

describe("resultadoDaPergunta", () => {
  const q: Pergunta = { id: "q", texto: "?", tipo: "escolha", opcoes: ["Sim", "Não"], obrigatoria: true }
  it("mostra toda opção, mesmo com zero, na ordem cadastrada", () => {
    const r = resultadoDaPergunta(q, [{ respostas: { q: "Não" } }, { respostas: { q: "Não" } }])
    expect(r).toEqual([
      { rotulo: "Sim", total: 0, percentual: 0 },
      { rotulo: "Não", total: 2, percentual: 100 },
    ])
  })
  it("ignora quem não respondeu e mantém opção que saiu da pesquisa", () => {
    const r = resultadoDaPergunta(q, [{ respostas: {} }, { respostas: { q: "Talvez" } }])
    expect(r.find((x) => x.rotulo === "Talvez")?.percentual).toBe(100)
  })
})

describe("normalizar / recentes", () => {
  it("tira acento e caixa", () => expect(normalizar(" Capão ")).toBe("capao"))
  it("filtra pela janela de dias", () => {
    const agora = new Date("2026-11-05T12:00:00Z")
    const lista = [{ criadaEm: "2026-11-04T12:00:00Z" }, { criadaEm: "2026-10-20T12:00:00Z" }]
    expect(recentes(lista, 7, agora)).toHaveLength(1)
  })
})
