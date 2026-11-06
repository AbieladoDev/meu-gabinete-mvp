"use client"

import * as React from "react"
import { Loader2, XIcon, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Para leitor de tela: o título visível é o `FormModalHeader` do formulário. */
  title: string
  description?: string
  /** Altura fixa um pouco maior que o conteúdo (até 78% da tela): a lista cresce sem o modal pular de tamanho. */
  tall?: boolean
  /** "md": modal menor, para ações rápidas. */
  size?: "lg" | "md"
  children: React.ReactNode
}

/**
 * Modal grande para formulário de cadastro (portado do degasBeer-admin).
 * Clicar fora NÃO fecha (perderia o que foi digitado): fecha pelo X ou pelo
 * Cancelar.
 *
 * O formulário dentro dele monta as três partes — `FormModalHeader`, corpo
 * com `FORM_MODAL_BODY` (o único que rola) e `FormModalFooter` — porque o
 * Salvar do rodapé precisa estar dentro do `<form>`.
 */
export function FormModal({ open, onOpenChange, title, description, tall, size = "lg", children }: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0",
          size === "md" ? "sm:max-w-lg" : "sm:max-w-3xl",
          tall && "h-[min(78vh,760px)]",
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description ?? title}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}

/** Corpo do formulário no modal: só ele rola, cabeçalho e rodapé ficam fixos. */
export const FORM_MODAL_BODY = "@container min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4"

interface FormModalHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  /** Sem ele não há X: o modal não pode ser fechado. */
  onClose?: () => void
  disabled?: boolean
}

/**
 * O cabeçalho PADRÃO de todo modal do painel: faixa fina e um tom mais escura
 * que o corpo, ícone do módulo, título e subtítulo; o X tem fundo próprio.
 * Modal novo usa este componente — não montar cabeçalho à mão.
 */
export function FormModalHeader({ icon: Icon, title, description, onClose, disabled }: FormModalHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b bg-muted/60 px-6 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{title}</span>
        <span className="truncate text-xs text-muted-foreground">{description}</span>
      </div>
      {onClose && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onClose}
          disabled={disabled}
          aria-label="Fechar"
          className="h-7 w-7 shrink-0 rounded-full bg-background text-muted-foreground hover:text-foreground"
        >
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

interface FormModalFooterProps {
  onCancel: () => void
  isLoading?: boolean
  /** Texto do botão principal (padrão "Salvar"). */
  submitLabel?: string
  disabled?: boolean
  /** Botão principal em vermelho (confirmar exclusão). */
  destructive?: boolean
  /** Texto enquanto salva (padrão "Salvando..."). */
  loadingLabel?: string
  /** À esquerda do rodapé (ex.: uma chave Ativo). */
  children?: React.ReactNode
}

/** Cancelar e Salvar fixos embaixo. */
export function FormModalFooter({
  onCancel,
  isLoading,
  submitLabel = "Salvar",
  disabled,
  destructive,
  loadingLabel = "Salvando...",
  children,
}: FormModalFooterProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t bg-muted/30 px-6 py-3">
      <div className="mr-auto flex flex-wrap items-center gap-x-5 gap-y-2">{children}</div>
      <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        type="submit"
        size="sm"
        variant={destructive ? "destructive" : "default"}
        disabled={isLoading || disabled}
        className="min-w-28"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  )
}
