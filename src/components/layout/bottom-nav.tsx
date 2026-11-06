"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ClipboardList, Home, LayoutGrid, Map as MapIcon, X, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { TOQUE } from "@/lib/anim"
import { useAuthStore } from "@/store/auth-store"
import { can } from "@/lib/permissions"
import { MobileMenuSheet } from "./mobile-menu-sheet"
import { isModuloAberto, useFilteredNavigation } from "./nav-config"

/**
 * A BARRA DE BAIXO DO CELULAR — o desenho do `todosDan-client` (22/10/2026),
 * padrão dos painéis da casa desde 31/10/2026:
 *
 * ```
 *  ╭──────────────────────────────╮  ╭───╮
 *  │  ⌂     ⚙                       │  │ ⊞ │
 *  ╰──────────────────────────────╯  ╰───╯
 * ```
 *
 * - A PÍLULA de vidro mostra os botões DO MÓDULO ABERTO, só ícones.
 * - O BOTÃO REDONDO da direita abre a grade com TODOS os módulos
 *   (`MobileMenuSheet`) — é por ele que se troca de módulo.
 * - O "+" de criar mora no cabeçalho.
 *
 * ⚠️ Os botões de cada módulo moram em `BOTOES_DO_MODULO`. Módulo que não
 * está lá cai no PADRÃO: o Início + o próprio módulo + os sub-itens dele
 * (`nav-config.ts`).
 *
 * ⚠️ Some enquanto se DIGITA: com o teclado encolhendo a página
 * (`interactiveWidget` no `app/layout.tsx`), ela subiria junto e ficaria
 * colada em cima do teclado.
 */
interface Botao {
  label: string
  href: string
  icon: LucideIcon
  permission?: string
}

const BOTOES_DO_MODULO: { prefixos: string[]; exato?: boolean; botoes: Botao[] }[] = [
  /* O Início mostra os atalhos mais usados. Módulo novo que quiser botões
     próprios entra aqui; sem entrada, vale o PADRÃO (Início + módulo +
     sub-itens). */
  {
    prefixos: ["/"],
    exato: true,
    botoes: [
      { label: "Início", href: "/", icon: Home },
      { label: "Mapa", href: "/mapa", icon: MapIcon },
      { label: "Pesquisas", href: "/pesquisas", icon: ClipboardList },
    ],
  },
]

/** Quebra "/gerencial?x=1" em caminho + parâmetros. */
function partes(href: string) {
  const [caminho, query = ""] = href.split("?")
  return { caminho, params: new URLSearchParams(query) }
}

export function BottomNav() {
  /* `useSearchParams` precisa de `Suspense`, senão quebra a pré-renderização. */
  return (
    <React.Suspense fallback={null}>
      <BarraDeBaixo />
    </React.Suspense>
  )
}

function BarraDeBaixo() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const permissions = useAuthStore((s) => s.permissions)
  const secoes = useFilteredNavigation()
  const [menuAberto, setMenuAberto] = React.useState(false)

  const botoes = React.useMemo<Botao[]>(() => {
    const doMapa = BOTOES_DO_MODULO.find((m) =>
      m.prefixos.some((p) =>
        m.exato ? pathname === p : pathname === p || pathname.startsWith(p + "/")
      )
    )
    if (doMapa) {
      return doMapa.botoes.filter(
        (b) => !b.permission || can(permissions, b.permission)
      )
    }

    /* O PADRÃO: o Início + o módulo da barra lateral + os sub-itens dele. */
    const item = secoes
      .flatMap((s) => s.items)
      .find((i) => i.url !== "/" && isModuloAberto(i, pathname))
    const inicio: Botao = { label: "Início", href: "/", icon: Home }
    if (!item) return [inicio]
    return [
      inicio,
      { label: item.title, href: item.url, icon: item.icon as LucideIcon },
      ...(item.items ?? []).map((f) => ({
        label: f.title,
        href: f.url,
        icon: f.icon as LucideIcon,
      })),
    ]
  }, [pathname, secoes, permissions])

  /**
   * UM botão aceso só. Ordem: o que tem parâmetro e bate, depois o caminho
   * exato, depois o caminho de que a rota é filha.
   */
  const ativo = React.useMemo(() => {
    const comParam = botoes.find((b) => {
      const { caminho, params } = partes(b.href)
      if (caminho !== pathname || params.size === 0) return false
      return [...params.entries()].every(([k, v]) => searchParams.get(k) === v)
    })
    if (comParam) return comParam.href
    const exato = botoes.find((b) => {
      const { caminho, params } = partes(b.href)
      return params.size === 0 && caminho === pathname
    })
    if (exato) return exato.href
    const pai = botoes.find((b) => {
      const { caminho, params } = partes(b.href)
      return params.size === 0 && caminho !== "/" && pathname.startsWith(caminho + "/")
    })
    return pai?.href ?? null
  }, [botoes, pathname, searchParams])

  return (
    <>
      {/* Solta do pé: área segura do aparelho + 1rem. */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] md:hidden [body:has(input:focus,textarea:focus)_&]:hidden">
        {/* SÓ ÍCONES e VIDRO: fundo bem transparente com blur forte. O nome
            do botão fica no `aria-label`/`title`. */}
        <div className="bg-background/40 flex h-14 min-w-0 flex-1 items-center justify-around rounded-full border border-white/20 px-1.5 shadow-lg backdrop-blur-xl backdrop-saturate-150 dark:border-white/10">
          {botoes.slice(0, 5).map((b) => (
            <BotaoDaBarra key={b.href} botao={b} ativo={ativo === b.href} />
          ))}
        </div>

        <button
          type="button"
          aria-label="Módulos"
          onClick={() => setMenuAberto((v) => !v)}
          className="bg-foreground/80 text-background flex size-14 shrink-0 items-center justify-center rounded-full shadow-lg backdrop-blur-xl transition-transform active:scale-95"
        >
          {menuAberto ? <X className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
        </button>
      </nav>

      {/* A grade com todos os módulos (substitui a barra lateral). */}
      <MobileMenuSheet open={menuAberto} onOpenChange={setMenuAberto} />
    </>
  )
}

function BotaoDaBarra({ botao, ativo }: { botao: Botao; ativo: boolean }) {
  const Icone = botao.icon
  return (
    <Link
      href={botao.href}
      aria-label={botao.label}
      title={botao.label}
      className={cn("flex min-w-0 flex-1 items-center justify-center", TOQUE)}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full transition-colors",
          ativo ? "bg-foreground text-background" : "text-foreground/70"
        )}
      >
        <Icone className="h-5 w-5" strokeWidth={1.75} />
      </span>
    </Link>
  )
}
