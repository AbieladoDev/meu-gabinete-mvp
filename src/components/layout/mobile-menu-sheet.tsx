"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { LogOut, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { TOQUE } from "@/lib/anim"
import { Bloco, Palco } from "@/components/common/entrada"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth-store"
import { useGreetingStore } from "@/store/greeting-store"
import { getInitials } from "@/lib/format"
import { mediaUrl } from "@/lib/media-url"
import { useFilteredNavigation, isNavItemActive } from "./nav-config"

interface MobileMenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Menu do celular: grade de módulos em vez da barra lateral do desktop
 * espremida numa gaveta. Desenho do `todosDan-client` (22/10/2026), padrão da
 * casa desde 31/10/2026: perfil numa linha fina com tema · Sair em ícone, e
 * os módulos em linhas com borda, 2 colunas.
 */
export function MobileMenuSheet({ open, onOpenChange }: MobileMenuSheetProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore()
  const sections = useFilteredNavigation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = theme === "dark"

  /** Grade única, sem os títulos de seção da barra lateral. */
  const items = sections.flatMap((section) => section.items)

  // Sair = o tchau; o logout de fato roda no fim dele (`GreetingLayer`)
  function handleLogout() {
    onOpenChange(false)
    useGreetingStore.getState().goodbye()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-3xl px-4 pb-safe [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Módulos e ajustes da conta</SheetDescription>
        </SheetHeader>

        {/* Puxador: dá o gesto de "arrasta pra fechar" que a gaveta sugere. */}
        <div className="flex justify-center pt-1 pb-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Perfil + ações da conta — UMA LINHA FINA: foto e nome à esquerda,
            tema · Sair só em ÍCONE do lado. */}
        <div className="flex items-center gap-2.5 rounded-2xl border bg-card px-3 py-2">
          {/* Foto e nome abrem o Meu perfil. */}
          <Link href="/gabinete" onClick={() => onOpenChange(false)} className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={mediaUrl(user?.avatarUrl) ?? undefined} alt={user?.name ?? ""} />
              <AvatarFallback>{getInitials(user?.name || "Usuário")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name ?? "Usuário"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
            </div>
          </Link>

          <button
            aria-label={mounted && isDark ? "Tema claro" : "Tema escuro"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {mounted && isDark ? (
              <Sun className="h-[1.125rem] w-[1.125rem]" />
            ) : (
              <Moon className="h-[1.125rem] w-[1.125rem]" />
            )}
          </button>
          <button
            aria-label="Sair"
            onClick={handleLogout}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-[1.125rem] w-[1.125rem]" />
          </button>
        </div>

        {/* Módulos: linha com borda, ícone + nome, 2 colunas; o ativo é preto. */}
        <Palco className="mt-4 grid grid-cols-2 gap-2 pb-4">
          {items.map((item) => {
            const Icon = item.icon
            const active = isNavItemActive(item.url, pathname, item.exact)
            return (
              <Bloco key={item.url} className="min-w-0">
                <Link
                  href={item.url}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex h-12 w-full min-w-0 items-center gap-2.5 rounded-xl border px-3 text-sm font-medium",
                    TOQUE,
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background hover:bg-muted active:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{item.title}</span>
                </Link>
              </Bloco>
            )
          })}
        </Palco>
      </SheetContent>
    </Sheet>
  )
}
