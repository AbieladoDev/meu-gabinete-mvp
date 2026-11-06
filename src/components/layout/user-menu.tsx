"use client"

import * as React from "react"
import {
  APOIO_DA_BARRA,
  ITEM_DA_BARRA,
  SUPERFICIE_DA_BARRA,
} from "@/components/layout/superficie-da-barra"
import { ChevronsUpDown, LogOut, Palette, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/auth-store"
import { useAparenciaStore } from "@/store/aparencia-store"
import { useGreetingStore } from "@/store/greeting-store"
import { mediaUrl } from "@/lib/media-url"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Quem sou eu — o rodapé da barra. Desenho do `todosDan-client`
 * (`user-menu.tsx` de lá), padrão da casa desde 31/10/2026: Meu perfil (01/11),
 * Aparência e Sair. (Histórico depende de auditoria — fica para a etapa do admin.)
 *
 * ⚠️ Tudo aqui dentro usa os tokens `--sidebar-*` — ver
 * `superficie-da-barra.ts`.
 */
export function UserMenu({
  compacto = false,
}: {
  /** Só o avatar — o pé do TRILHO (23/10/2026). Sem ele, o bloco da barra antiga. */
  compacto?: boolean
} = {}) {
  const { user } = useAuthStore()
  const abrirAparencia = useAparenciaStore((s) => s.abrir)
  const [aberto, setAberto] = React.useState(false)
  const router = useRouter()

  const userName = user?.name || "Usuário"
  const userEmail = user?.email || ""
  // avatarUrl é a CHAVE da foto; a URL sai de mediaUrl
  const fotoUrl = mediaUrl(user?.avatarUrl) ?? undefined
  const userGroup = user?.group?.name ?? "Sem grupo"

  // Sair = o tchau; o logout de fato roda no fim dele (`GreetingLayer`)
  function handleLogout() {
    setAberto(false)
    useGreetingStore.getState().goodbye()
  }

  const linha = cn(
    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors",
    "text-sidebar-foreground/70",
    ITEM_DA_BARRA
  )

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        {compacto ? (
          <button
            type="button"
            aria-label={userName}
            title={userName}
            className="rounded-full ring-2 ring-transparent transition-shadow hover:ring-sidebar-foreground/30 data-[state=open]:ring-sidebar-foreground/50"
          >
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={fotoUrl} alt={userName} />
              <AvatarFallback className="rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-foreground">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
        <SidebarMenuButton
          size="lg"
          tooltip={userName}
          className="data-[state=open]:bg-sidebar-accent"
        >
          <Avatar className="h-8 w-8 shrink-0 rounded-full group-data-[collapsible=icon]:mx-auto">
            <AvatarImage src={fotoUrl} alt={userName} />
            <AvatarFallback className="rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-foreground">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{userName}</span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {userEmail}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
        </SidebarMenuButton>
        )}
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="end"
        sideOffset={8}
        className={cn("w-64 p-1", SUPERFICIE_DA_BARRA)}
      >
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar className="h-9 w-9 shrink-0 rounded-full">
            <AvatarImage src={fotoUrl} alt={userName} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground rounded-full text-xs font-medium">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className={cn("truncate text-xs", APOIO_DA_BARRA)}>
              {userEmail || userGroup}
            </p>
          </div>
        </div>

        <div className="bg-sidebar-border my-1 h-px" />

        <button
          type="button"
          onClick={() => {
            setAberto(false)
            router.push("/gabinete")
          }}
          className={linha}
        >
          <UserRound className="h-4 w-4" strokeWidth={1.5} />
          Meu gabinete
        </button>

        {/* APARÊNCIA abre o modal montado na casca (`painel-shell.tsx`). */}
        <button
          type="button"
          onClick={() => {
            setAberto(false)
            abrirAparencia()
          }}
          className={linha}
        >
          <Palette className="h-4 w-4" strokeWidth={1.5} />
          Aparência
        </button>

        <div className="bg-sidebar-border my-1 h-px" />

        <button
          type="button"
          onClick={handleLogout}
          className={cn(linha, "text-destructive hover:text-destructive")}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sair
        </button>
      </PopoverContent>
    </Popover>
  )
}
