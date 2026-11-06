"use client"

import * as React from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { GABINETE_DEMO, PESQUISAS_DEMO, atuacoesDemo, respostasDemo } from "@/data/seed"
import type { Atuacao, Gabinete, Pesquisa, Resposta } from "@/data/tipos"

/**
 * O "BANCO" DO MVP — zustand + localStorage (chave `meugabinete-demo`).
 * As ações têm nome de endpoint para virar o `meugabinete-api` depois.
 *
 * ⚠️ Só front: o formulário público grava no navegador de QUEM RESPONDE.
 * Para a demo, responder no mesmo navegador do painel.
 */

interface GabineteState {
  gabinete: Gabinete
  pesquisas: Pesquisa[]
  respostas: Resposta[]
  atuacoes: Atuacao[]

  registrarAtuacao: (dados: Omit<Atuacao, "id" | "criadaEm">) => void
  editarAtuacao: (id: string, dados: Omit<Atuacao, "id" | "criadaEm">) => void
  excluirAtuacao: (id: string) => void
  salvarGabinete: (dados: Gabinete) => void
  criarPesquisa: (dados: Omit<Pesquisa, "id" | "criadaEm">) => Pesquisa
  editarPesquisa: (id: string, dados: Omit<Pesquisa, "id" | "criadaEm">) => void
  alternarPesquisa: (id: string) => void
  excluirPesquisa: (id: string) => void
  registrarResposta: (dados: Omit<Resposta, "id" | "criadaEm">) => Resposta
  excluirResposta: (id: string) => void
  restaurarDemo: () => void
}

export function novoId(prefixo: string) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function inicial() {
  const respostas = respostasDemo()
  return {
    gabinete: GABINETE_DEMO,
    pesquisas: PESQUISAS_DEMO,
    respostas,
    atuacoes: atuacoesDemo(respostas),
  }
}

export const useGabineteStore = create<GabineteState>()(
  persist(
    (set) => ({
      ...inicial(),

      salvarGabinete: (dados) => set({ gabinete: dados }),

      criarPesquisa: (dados) => {
        const pesquisa: Pesquisa = { ...dados, id: novoId("p"), criadaEm: new Date().toISOString() }
        set((s) => ({ pesquisas: [pesquisa, ...s.pesquisas] }))
        return pesquisa
      },

      editarPesquisa: (id, dados) =>
        set((s) => ({ pesquisas: s.pesquisas.map((p) => (p.id === id ? { ...p, ...dados } : p)) })),

      alternarPesquisa: (id) =>
        set((s) => ({ pesquisas: s.pesquisas.map((p) => (p.id === id ? { ...p, ativa: !p.ativa } : p)) })),

      excluirPesquisa: (id) =>
        set((s) => {
          const saem = new Set(s.respostas.filter((r) => r.pesquisaId === id).map((r) => r.id))
          return {
            pesquisas: s.pesquisas.filter((p) => p.id !== id),
            respostas: s.respostas.filter((r) => !saem.has(r.id)),
            atuacoes: s.atuacoes.filter((a) => !saem.has(a.pessoaId)),
          }
        }),

      registrarResposta: (dados) => {
        const resposta: Resposta = { ...dados, id: novoId("r"), criadaEm: new Date().toISOString() }
        set((s) => ({ respostas: [resposta, ...s.respostas] }))
        return resposta
      },

      excluirResposta: (id) =>
        set((s) => ({
          respostas: s.respostas.filter((r) => r.id !== id),
          atuacoes: s.atuacoes.filter((a) => a.pessoaId !== id),
        })),

      registrarAtuacao: (dados) =>
        set((s) => ({
          atuacoes: [{ ...dados, id: novoId("a"), criadaEm: new Date().toISOString() }, ...s.atuacoes],
        })),

      editarAtuacao: (id, dados) =>
        set((s) => ({ atuacoes: s.atuacoes.map((a) => (a.id === id ? { ...a, ...dados } : a)) })),

      excluirAtuacao: (id) => set((s) => ({ atuacoes: s.atuacoes.filter((a) => a.id !== id) })),

      restaurarDemo: () => set(inicial()),
    }),
    { name: "meugabinete-demo", version: 1 }
  )
)

/** Antes do persist ler o localStorage tudo parece o seed — quem depende do dado gravado espera isto. */
export function useHidratado() {
  return React.useSyncExternalStore(
    (avisar) => useGabineteStore.persist.onFinishHydration(avisar),
    () => useGabineteStore.persist.hasHydrated(),
    () => false
  )
}
