"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { ArrowLeft, ArrowRight, PanelLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useFilteredNavigation } from "./nav-config"
import { acoesDaSecao, NavSectionHeader } from "./nav-section-header"
import { useQuickCreateActions } from "./quick-create"
import { NavModule } from "./nav-module"
import { useBarraStore } from "@/store/barra-store"
import { UserMenu } from "./user-menu"

/**
 * A BARRA LATERAL — a do `todosDan-client`, padrão da casa desde 31/10/2026:
 * barra única até o topo (marca + voltar/avançar + recolher), blocos com
 * rótulo, `…` de criar e minimizar por bloco, módulos fixáveis no topo,
 * sub-itens em flyout e o "quem sou eu" no rodapé. Os módulos vêm de
 * `nav-config.ts` — não declarar item aqui.
 *
 * LINHAS UM POUCO MENORES — igual ao client (27/10/2026 lá): 1.875rem e texto
 * 13px, só com a barra aberta.
 */
const LINHA_MENOR =
  "group-data-[state=expanded]:[&_[data-sidebar=menu-button]]:h-[1.875rem] group-data-[state=expanded]:[&_[data-sidebar=menu-button]]:text-[0.8125rem]"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const filteredNavigation = useFilteredNavigation()

  /**
   * OS MÓDULOS FIXADOS (30/08/2026) — atalho no topo, resolvido contra a
   * navegação FILTRADA por permissão.
   *
   * ⚠️ Resolver contra a navegação filtrada é o que impede um módulo fixado
   * de sobreviver à perda da permissão: a url continua no localStorage, mas
   * some da barra — e a tela responderia acesso negado.
   */
  const hidratarBarra = useBarraStore((s) => s.hidratar)
  const fixados = useBarraStore((s) => s.fixados)
  const recolhidos = useBarraStore((s) => s.recolhidos)
  const alternarRecolhido = useBarraStore((s) => s.alternarRecolhido)
  React.useEffect(() => {
    hidratarBarra()
  }, [hidratarBarra])

  const modulosFixados = React.useMemo(() => {
    const todos = filteredNavigation.flatMap((sec) => sec.items)
    return fixados
      .map((url) => todos.find((i) => i.url === url))
      .filter((i): i is (typeof todos)[number] => !!i)
  }, [filteredNavigation, fixados])

  /**
   * A navegação SEM os fixados — eles SOBEM para o bloco do topo em vez de
   * aparecerem duas vezes (30/08/2026, decisão do Arthur).
   *
   * ⚠️ **Seção que fica vazia some junto**: com "Modalidades" e "Exercícios"
   * fixados, o bloco "Ensino" sobraria como um rótulo sem itens embaixo.
   */
  const navegacao = React.useMemo(
    () =>
      filteredNavigation
        .map((sec) => ({
          ...sec,
          items: sec.items.filter((i) => !fixados.includes(i.url)),
        }))
        .filter((sec) => sec.items.length > 0),
    [filteredNavigation, fixados]
  )

  /* Uma chamada só, aqui: `acoesDaSecao` é função PURA porque um hook dentro
     do `.map` das seções quebraria as regras de hooks — a lista de seções
     muda de tamanho conforme a permissão. */
  const quickCreate = useQuickCreateActions()

  /**
   * Traz o item ATIVO para a vista quando a rota muda.
   *
   * Com os sub-itens todos visíveis (21/08/2026) a barra passou a ser mais
   * alta que a tela: abrir "Contas a pagar" deixava o item aceso fora do campo
   * de visão, e a barra parecia não ter reagido ao clique. `nearest` de
   * propósito — só rola o necessário, sem recentralizar o menu inteiro a cada
   * navegação.
   */
  React.useEffect(() => {
    /**
     * O FILHO primeiro, e o pai só como reserva.
     *
     * Num seletor com vírgula o `querySelector` devolve o primeiro elemento na
     * ordem do DOM — que é sempre o pai, já visível. O item que precisa ser
     * trazido para a vista é o sub-item.
     */
    const ativo =
      document.querySelector<HTMLElement>(
        '[data-sidebar="menu-sub-button"][data-active="true"]'
      ) ??
      document.querySelector<HTMLElement>(
        '[data-sidebar="menu-button"][data-active="true"]'
      )
    ativo?.scrollIntoView({ block: "nearest" })
  }, [pathname])

  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* O TOPO DA BARRA = o do client: MARCA + VOLTAR/AVANÇAR + RECOLHER. A
          barra sobe até o topo da tela; o cabeçalho mora dentro da janela.
          ⚠️ `REPLACE` vira o nome do projeto (`/novo-projeto`, passo 5);
          cliente com logo troca o quadrado pela imagem. */}
      <SidebarHeader className="px-2 py-3 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col">
          <Link
            href="/"
            aria-label="Início"
            className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:p-1"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              MG
            </span>
            <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
              Meu Gabinete
            </span>
          </Link>
          <div className="flex items-center group-data-[collapsible=icon]:flex-col">
            <BotaoDeHistorico direcao="voltar" />
            <BotaoDeHistorico direcao="avancar" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label="Recolher a barra lateral"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Recolher a barra</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarHeader>

      {/* Sem rolagem: com os sub-itens em painel lateral (`nav-module.tsx`) a
          barra tem ~9 linhas e cabe na tela. `overflow-y-auto` continua como
          rede — academia com muitos módulos futuros, ou zoom alto do sistema,
          ainda precisa poder rolar. */}
      {/*
        ⚠️ `px-0` quando RECOLHIDA — e isto conserta um desalinhamento medido,
        não é preferência.

        O conteúdo tem DOIS níveis de padding horizontal (`SidebarContent` +
        `SidebarGroup`) e o rodapé tem UM (`SidebarFooter`). Com o trilho em
        4rem isso não aparecia: 4rem é exatamente 2+2+botão+2+2, e sobrava
        simetria para os dois. Ao encolher o trilho para 3.5rem (25/08/2026), o
        conteúdo passou a começar 17px da borda e o rodapé 9px — os ícones de
        Histórico, Configurações e o avatar ficaram **9px à esquerda** dos
        módulos, numa coluna de 61px.

        A saída é zerar o padding nos dois e deixar os `SidebarMenu`
        centralizarem (`items-center` logo abaixo): assim o alinhamento não
        depende de a soma dos paddings casar com a largura do trilho.
      */}
      <SidebarContent className="min-h-0 flex-1 overflow-y-auto px-2 py-2 group-data-[collapsible=icon]:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* ---------- FIXADOS (30/08/2026) ----------

            Os módulos que a pessoa prendeu no topo. Cada academia usa cinco
            das vinte e cinco telas, e as outras vinte eram ruído permanente
            entre elas.

            ⚠️ **O módulo SOBE para cá e SAI do bloco de origem** (decisão do
            Arthur): repetido nos dois lugares, a mesma linha aparecia duas
            vezes na barra e a de baixo virava ruído. Seção que fica sem itens
            some junto.

            ⚠️ **Aparece também com a barra RECOLHIDA**, e tem de aparecer: com
            o módulo saindo do bloco de origem, escondê-lo aqui o faria sumir
            da barra inteira no modo padrão. O rótulo "Fixados" é que some
            (não cabe em 3.5rem) — o que separa é a divisória, como nas outras
            seções. */}
        {modulosFixados.length > 0 && (
          <SidebarGroup className="px-0 py-1">
            <NavSectionHeader label="Fixados" acoes={[]} />
            <SidebarGroupContent>
              <SidebarMenu className={cn("group-data-[collapsible=icon]:items-center", LINHA_MENOR)}>
                {modulosFixados.map((item) => (
                  <NavModule
                    key={`fixado-${item.url}`}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {navegacao.map((section, index) => (
          <SidebarGroup
            key={section.label ?? `section-${index}`}
            /* PALAVRA no lugar da divisória (28/08/2026) — e a divisória
               fica só para a barra RECOLHIDA, onde o rótulo não cabe.
               ⚠️ `border-sidebar-border` e não `border-border`: a barra
               inverte com o tema (preta no claro, branca no escuro) e o
               token da PÁGINA erraria a cor nos dois.
               ⚠️ Recolhida, a divisória tem a LARGURA DOS ÍCONES
               (`w-8 mx-auto`), não a da barra: de ponta a ponta ela media
               61px contra 35 dos ícones, e a diferença lia como linha
               torta. */
            className={cn(
              "px-0 py-1",
              (index > 0 || modulosFixados.length > 0) &&
                "mt-1 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:border-t group-data-[collapsible=icon]:border-sidebar-border group-data-[collapsible=icon]:pt-2"
            )}
          >
            {section.label && (
              <NavSectionHeader
                label={section.label}
                acoes={acoesDaSecao(section, quickCreate)}
                recolhido={recolhidos.includes(section.label)}
                onAlternar={() => alternarRecolhido(section.label!)}
              />
            )}
            {/* Minimizado, o bloco some da barra ABERTA. ⚠️ Com a barra
                RECOLHIDA (só ícones) ele continua aparecendo: lá não há
                rótulo nem botão para reabrir, e o módulo sumiria da barra. */}
            <SidebarGroupContent
              className={cn(
                section.label &&
                  recolhidos.includes(section.label) &&
                  "hidden group-data-[collapsible=icon]:block"
              )}
            >
              <SidebarMenu className={cn("group-data-[collapsible=icon]:items-center", LINHA_MENOR)}>
                {section.items.map((item) => (
                  <NavModule
                    key={item.url}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* O rodapé é só QUEM SOU EU (Aparência e Sair ficam no menu dele). */}
      <SidebarFooter className="gap-0 p-2 group-data-[collapsible=icon]:px-0">
        {/* Mesma regra da divisória entre blocos de módulos: a barra inverte
            com o tema, então `border-sidebar-border` e não `border-border`. */}
        {/* Sem linha em cima (igual ao client, 26/10/2026 lá) — só com a barra
            RECOLHIDA, onde não há rótulo para separar. */}
        <SidebarMenu className="mt-2 group-data-[collapsible=icon]:border-t group-data-[collapsible=icon]:border-sidebar-border group-data-[collapsible=icon]:pt-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

/** Voltar/avançar no histórico do navegador — o topo da barra (cópia do client). */
function BotaoDeHistorico({ direcao }: { direcao: "voltar" | "avancar" }) {
  const router = useRouter()
  const voltar = direcao === "voltar"
  const Icone = voltar ? ArrowLeft : ArrowRight
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => (voltar ? router.back() : router.forward())}
          aria-label={voltar ? "Voltar" : "Avançar"}
          className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
        >
          <Icone className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{voltar ? "Voltar" : "Avançar"}</TooltipContent>
    </Tooltip>
  )
}
