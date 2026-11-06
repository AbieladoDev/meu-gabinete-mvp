"use client"

import * as React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { BottomNav } from "./bottom-nav"
import { AparenciaMenu } from "./aparencia-menu"
import { PAGE_ASIDE_ID } from "./page-aside"
import { AuthGuard } from "@/components/auth/auth-guard"

/**
 * A CASCA DO PAINEL — barra lateral e a janela de conteúdo. É a casca do
 * `todosDan-client`, PADRÃO DA CASA desde 31/10/2026 (pedido do Arthur):
 *
 * - **Computador:** BARRA ÚNICA (`AppSidebar`, até o topo) + JANELA SOLTA
 *   (margem nos quatro lados, canto arredondado, borda e sombra sobre o fundo
 *   da barra) com o cabeçalho do módulo dentro (`AppHeader`: trilha · busca ·
 *   online · +).
 * - **Celular:** cabeçalho claro com "Olá, Nome" + o +, e a pílula de vidro
 *   embaixo (`BottomNav`) com o botão redondo que abre a grade de módulos.
 *
 * Montada UMA vez em `src/app/(painel)/layout.tsx` — um `layout.tsx` do Next
 * não é desmontado quando a rota filha muda, então a barra e o cabeçalho não
 * piscam a cada navegação.
 *
 * ⚠️ **Não devolver `SidebarProvider`, `AppHeader` ou `AppSidebar` para o
 * `DashboardLayout`.** O `DashboardLayout` cuida do que é DA TELA: trilha,
 * título, ações, barra de filtros e o `main`.
 *
 * ⚠️ **O `AuthGuard` mora aqui.** Nada mais no projeto o monta.
 */
export function PainelShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {/* `flex-col`: a linha barra+janela é o filho que cresce. */}
      <SidebarProvider
        /**
         * ⚠️ **A barra abre RECOLHIDA** (25/08/2026, pedido do Arthur). Em
         * monitor pequeno a coluna de 14rem comia largura que faz falta nas
         * telas de grade e de tabela, e os modulos se reconhecem pelo icone.
         *
         * ⚠️ **Isto vale so para o PRIMEIRO acesso**: o `SidebarProvider`
         * persiste a escolha em `localStorage` (`sidebar_state`) e a le no
         * mount, com `try/catch` para o navegador que bloqueia storage.
         *
         * ⚠️ Desde 28/08/2026 este estado tambem SOBREVIVE a navegacao — antes
         * ele era recriado a cada tela e so o `localStorage` o salvava.
         */
        defaultOpen={false}
        className="flex-col"
        /* O cabeçalho mora DENTRO da janela e a barra sobe até o topo: nada a descontar. */
        style={{ "--app-header-h": "0rem" } as React.CSSProperties}
      >
        {/* O fundo desta linha é o da BARRA: é ele que aparece na moldura em
            volta da janela de conteúdo. */}
        <div className="flex min-h-0 w-full flex-1 bg-sidebar">
          <AppSidebar />
          {/* JANELA SOLTA, igual ao client (30/10/2026): margem nos QUATRO lados,
              canto arredondado inteiro, borda e sombra — o conteúdo flutua
              sobre o fundo da barra. No celular não há barra lateral. */}
          <SidebarInset className="min-h-0 overflow-hidden md:m-2 md:rounded-2xl md:border md:shadow-lg">
            {/* O cabeçalho é a primeira faixa da janela (igual ao client). */}
            <AppHeader />
            {/* ⚠️ A tela usa `h-full`: direto no `SidebarInset` ela mediria a
                janela INTEIRA, sem descontar o cabeçalho, e passaria do fim
                (corrigido no todosDan-client em 30/10/2026). Este contêiner é
                a altura que sobra. A coluna da direita (`PageAside`) vai do
                cabeçalho ao fim e só aparece quando uma tela põe algo nela. */}
            <div className="flex min-h-0 flex-1">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
              <div
                id={PAGE_ASIDE_ID}
                className="fixed inset-0 z-40 flex min-h-0 flex-col bg-background empty:hidden lg:static lg:z-auto lg:w-[var(--page-aside-w,40%)] lg:shrink-0 lg:border-l"
              />
            </div>
          </SidebarInset>
        </div>
        <BottomNav />
        {/* Aparência (22/10/2026): só o modal, aberto pelo item do menu do
            usuário — o lápis saiu do cabeçalho, como no client. */}
        <AparenciaMenu semGatilho />
      </SidebarProvider>
    </AuthGuard>
  )
}
