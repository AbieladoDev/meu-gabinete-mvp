"use client"

import { ClipboardPlus, HandHelping } from "lucide-react"

import { useAuthStore } from "@/store/auth-store"
import { can } from "@/lib/permissions"

export interface QuickCreateAction {
  label: string
  description: string
  icon: React.ElementType
  href: string
  /** Chave do registry da API. Sem ela o item aparece para todo mundo. */
  permission?: string
  /** Fundo + cor do ícone. Só no menu do celular, que mostra os selos. */
  color: string
}

/**
 * "Criar" de todos os módulos, num lugar só (casca do todosDan, 31/10/2026).
 *
 * Três consumidores — o `+` do cabeçalho, os `…` de cada bloco da barra
 * (`acoesDaSecao` casa pela ROTA) e a folha de ações do celular. Uma lista
 * que diverge entre desktop e celular é menu em que ninguém confia.
 *
 * Cada item leva para a PÁGINA de criação; nada é criado a partir do menu.
 */
export const QUICK_CREATE: QuickCreateAction[] = [
  {
    label: "Nova pesquisa",
    description: "Formulário para a população",
    icon: ClipboardPlus,
    href: "/pesquisas?nova=1",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    label: "Registrar atuação",
    description: "O que o gabinete fez por alguém",
    icon: HandHelping,
    href: "/atuacoes?nova=1",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
]

/**
 * Só o que a pessoa pode criar. Lê as permissões direto do store: um hook por
 * item quebraria as regras de hooks assim que a lista mudasse de tamanho.
 */
export function useQuickCreateActions(): QuickCreateAction[] {
  const permissions = useAuthStore((s) => s.permissions)
  return QUICK_CREATE.filter(
    (a) => !a.permission || can(permissions, a.permission)
  )
}
