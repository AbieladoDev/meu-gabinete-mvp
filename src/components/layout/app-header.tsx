"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronRight, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommandSearch } from "@/components/common/command-search"
import { useAuthStore } from "@/store/auth-store"
import { useTrilhaStore } from "@/store/trilha-store"
import { getInitials } from "@/lib/format"
import { mediaUrl } from "@/lib/media-url"
import { useQuickCreateActions } from "./quick-create"
import { BottomNavActionMenu } from "./bottom-nav-action-menu"
import { iconeDaUrl } from "./nav-config"

/**
 * O CABEÇALHO — o do `todosDan-client`, padrão da casa desde 31/10/2026: mora
 * DENTRO da janela, como primeira faixa dela.
 *
 * - **Computador** (cabeçalho do módulo): fundo da janela (`.cabecalho-modulo`),
 *   TRILHA à esquerda ("Dashboard › [ícone] Gerencial › Nome", publicada pelo
 *   `DashboardLayout`), BUSCA no centro e, à direita, quem está online + o +.
 * - **Celular**: o de antes — quem entrou à esquerda e só o + à direita
 *   (`.cabecalho-celular`).
 *
 * ⚠️ UMA instância só do `CommandSearch`: é ela que escuta o Ctrl+K. No celular
 * o bloco some, mas ela continua montada.
 */
export function AppHeader() {
  const quickCreate = useQuickCreateActions()
  const [criarAberto, setCriarAberto] = React.useState(false)

  return (
    <header className="cabecalho-celular cabecalho-modulo bg-sidebar text-sidebar-foreground flex h-12 shrink-0 items-center gap-3 border-b px-4 max-md:h-16 max-md:border-b-0">
      {/* ⚠️ As laterais são `flex-1 basis-0`: é o que mantém a busca no CENTRO
          da janela com a trilha e o grupo da direita de larguras diferentes. */}
      <div className="flex min-w-0 flex-1 basis-0 items-center gap-2 max-md:hidden">
        <TrilhaDoCabecalho />
      </div>
      <PerfilNoCelular />

      <div className="flex min-w-0 shrink items-center justify-center max-md:hidden">
        <CommandSearch modulo />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 md:flex-1 md:basis-0">
        {/* Quem mais está com o painel aberto (some sem ninguém). */}
        <span className="max-md:hidden">
        </span>
        <span className="max-md:hidden">
          <BotaoCriar />
        </span>
        {/* Celular: o + abre a folha de criar, como antes. */}
        <button
          type="button"
          aria-label="Criar"
          onClick={() => setCriarAberto(true)}
          className={cn(BOTAO_DO_CELULAR, "md:hidden", quickCreate.length === 0 && "hidden")}
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
        <BottomNavActionMenu open={criarAberto} onOpenChange={setCriarAberto} />
      </div>
    </header>
  )
}

/**
 * A trilha do cabeçalho — CÓPIA da do client: SEMPRE parte de "Dashboard" e
 * cada módulo leva o ÍCONE dele (o mesmo da barra lateral). Tokens
 * `--sidebar-*`: aqui eles valem os da página (`.cabecalho-modulo`).
 */
function TrilhaDoCabecalho() {
  const pathname = usePathname()
  const degraus = useTrilhaStore((s) => s.degraus)
  const atual = useTrilhaStore((s) => s.atual)
  if (!atual) return null

  /* "Início" é como o resto do painel chama o "/"; aqui é "Dashboard", como no client. */
  const nome = (d: { title: string; url: string }) =>
    d.url === "/" ? "Dashboard" : d.title

  return (
    <nav aria-label="Trilha" className="flex min-w-0 items-center gap-1.5 text-xs">
      {degraus.map((d) => (
        <span key={d.url} className="flex shrink-0 items-center gap-1.5">
          <Link
            href={d.url}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground flex items-center gap-1.5 transition-colors"
          >
            {d.url !== "/" && <IconeDaRota url={d.url} />}
            {nome(d)}
          </Link>
          <ChevronRight className="text-sidebar-foreground/40 h-3 w-3" />
        </span>
      ))}
      <span className="bg-sidebar-accent text-sidebar-foreground flex min-w-0 items-center gap-1.5 rounded-md px-2 py-0.5 font-medium">
        <IconeDaRota url={pathname} />
        <span className="truncate">{pathname === "/" ? "Dashboard" : atual}</span>
      </span>
    </nav>
  )
}

/** O ícone do módulo da url, ou nada (`createElement`: o React Compiler recusa `<Icone />` local). */
function IconeDaRota({ url }: { url: string }) {
  const icone = iconeDaUrl(url)
  if (!icone) return null
  return React.createElement(icone, {
    className: "h-3.5 w-3.5 shrink-0",
    strokeWidth: 1.5,
  })
}

/** O + do cabeçalho, SEM fundo como no client: leva às páginas de criação. */
function BotaoCriar() {
  const router = useRouter()
  const quickCreate = useQuickCreateActions()
  if (quickCreate.length === 0) return null

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Criar"
              className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <Plus className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Criar</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>Criar</DropdownMenuLabel>
        {quickCreate.map(({ label, href, icon: Icon }) => (
          <DropdownMenuItem key={href} onSelect={() => router.push(href)}>
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Foto + "Olá, Nome" + e-mail — o topo do celular. Tocar abre o Meu perfil
 * (igual ao client).
 */
function PerfilNoCelular() {
  const user = useAuthStore((s) => s.user)
  const nome = user?.name || "Usuário"
  const primeiro = nome.trim().split(" ")[0]

  return (
    <Link href="/gabinete" className="flex min-w-0 flex-1 items-center gap-2.5 md:hidden">
      <Avatar className="size-11 shrink-0">
        <AvatarImage src={mediaUrl(user?.avatarUrl) ?? undefined} alt={nome} />
        <AvatarFallback className="text-xs">{getInitials(nome)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate text-base leading-tight font-semibold">
          Olá, {primeiro}
        </span>
        <span className="text-sidebar-foreground/60 block truncate text-xs leading-tight">
          {user?.email ?? ""}
        </span>
      </span>
    </Link>
  )
}

/** O + do celular (sem fundo: `--sidebar-accent` é transparente lá). */
const BOTAO_DO_CELULAR =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground/80 transition-colors hover:bg-sidebar-foreground hover:text-sidebar"
