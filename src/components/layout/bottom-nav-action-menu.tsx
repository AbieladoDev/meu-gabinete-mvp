"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useQuickCreateActions, QuickCreateAction } from "./quick-create"

interface BottomNavActionMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BottomNavActionMenu({ open, onOpenChange }: BottomNavActionMenuProps) {
  const router = useRouter()
  /**
   * A lista vem de `quick-create.ts`, a MESMA do botão `+` do cabeçalho.
   * Antes ela era declarada aqui dentro, e o celular ficou com seis atalhos
   * enquanto o desktop não tinha nenhum — atalho que diverge entre as duas
   * telas é atalho em que ninguém confia.
   */
  const filteredActions = useQuickCreateActions()

  const handleActionClick = (action: QuickCreateAction) => {
    router.push(action.href)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-4 pb-safe [&>button]:hidden"
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Ações Rápidas</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3 pb-4">
          {filteredActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => handleActionClick(action)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl",
                  "border border-border bg-card",
                  "transition-all duration-200",
                  "hover:scale-[1.02] hover:shadow-md",
                  "active:scale-[0.98]"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl",
                  action.color
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {filteredActions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma ação disponível</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
