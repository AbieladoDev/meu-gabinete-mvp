"use client"

import * as React from "react"
import { ClipboardList, HandHelping, LayoutDashboard, Map as MapIcon, UsersRound } from "lucide-react"

import { useAuthStore } from "@/store/auth-store"
import { canAny } from "@/lib/permissions"

/**
 * A NAVEGAÇÃO DO PAINEL — fonte única da barra lateral, do flyout de
 * sub-itens, da trilha do cabeçalho e do menu do celular. Formato e peças
 * copiados do `todosDan-client`/`todosDan-admin` (31/10/2026): é a casca
 * padrão dos painéis da casa.
 *
 * Módulo novo entra aqui (o `pnpm novo-modulo` já faz isso), na seção que
 * fizer sentido. Seção = bloco da barra com rótulo; `items` de um módulo =
 * sub-itens no painel lateral (flyout).
 *
 * ⚠️ O Dashboard é `/` (grupo `(painel)`, rotas na raiz). `isNavItemActive`
 * e `degrausDaRota` tratam `/` como o prefixo de tudo.
 */

export interface NavLink {
  title: string
  url: string
  icon: React.ElementType
  permissions?: string[]
  /** Só acende na rota exata — para item cuja url é prefixo de outro item. */
  exact?: boolean
  /** Uma linha dizendo o que o módulo resolve (cabeçalho do flyout). */
  description?: string
  /** Páginas de dentro do módulo, abertas no flyout. */
  items?: NavLink[]
  /** Rotas que também mantêm este módulo aberto, além da própria `url`. */
  activeOn?: string[]
}

export interface NavSection {
  label?: string
  items: NavLink[]
}

export const navSections: NavSection[] = [
  {
    label: "Visão geral",
    items: [
      {
        title: "Início",
        url: "/",
        description: "O que chegou das pesquisas",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "Mapa",
        url: "/mapa",
        description: "Onde estão as pessoas que responderam",
        icon: MapIcon,
      },
    ],
  },
  {
    label: "Pesquisas",
    items: [
      {
        title: "Pesquisas",
        url: "/pesquisas",
        description: "Formulários enviados para a população",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Atendimento",
    items: [
      {
        title: "Pessoas",
        url: "/pessoas",
        description: "Quem respondeu e onde mora",
        icon: UsersRound,
      },
      {
        title: "Atuações",
        url: "/atuacoes",
        description: "O que o gabinete fez por cada pessoa",
        icon: HandHelping,
      },
    ],
  },
]

/** Seções da navegação filtradas pelas permissões do usuário. */
export function useFilteredNavigation(): NavSection[] {
  const { permissions: userPermissions } = useAuthStore()

  const hasAnyPermission = React.useCallback(
    (permissions?: string[]) => canAny(userPermissions, permissions),
    [userPermissions]
  )

  return React.useMemo(() => {
    return navSections
      .map((section) => ({
        ...section,
        items: section.items
          .filter((item) => hasAnyPermission(item.permissions))
          .map((item) => ({
            ...item,
            items: item.items?.filter((sub) =>
              hasAnyPermission(sub.permissions)
            ),
          })),
      }))
      .filter((section) => section.items.length > 0)
  }, [hasAnyPermission])
}

/** Item ativo pela rota atual — "/" só casa exato (é prefixo de tudo). */
export function isNavItemActive(
  url: string,
  pathname: string,
  exact = false
): boolean {
  if (url === "/" || exact) return pathname === url
  return pathname === url || pathname.startsWith(url + "/")
}

/** O módulo está aberto? Própria rota, `activeOn` ou qualquer sub-item. */
export function isModuloAberto(item: NavLink, pathname: string): boolean {
  if (isNavItemActive(item.url, pathname, item.exact)) return true
  if (item.activeOn?.some((url) => isNavItemActive(url, pathname))) return true
  return (
    item.items?.some((sub) => isNavItemActive(sub.url, pathname, sub.exact)) ??
    false
  )
}

/**
 * O módulo a que a rota atual pertence — o primeiro degrau da trilha.
 * `null` quando a rota é o próprio módulo ou não pertence a nenhum.
 */
export function moduloDaRota(
  pathname: string
): { title: string; url: string } | null {
  for (const section of navSections) {
    for (const item of section.items) {
      if (pathname === item.url) return null
      if (isModuloAberto(item, pathname)) {
        return { title: item.title, url: item.url }
      }
    }
  }
  return null
}

/**
 * O ícone do módulo (ou sub-item) dono desta url — exata. Usado pela trilha
 * do cabeçalho do módulo (30/10/2026, cópia do client): "Dashboard › [ícone] Gerencial".
 */
export function iconeDaUrl(url: string): React.ElementType | null {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.url === url) return item.icon
      for (const sub of item.items ?? []) {
        if (sub.url === url) return sub.icon
      }
    }
  }
  return null
}
