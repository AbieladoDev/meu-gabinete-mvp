"use client"

import { Trash2 } from "lucide-react"
import { FormModal, FormModalFooter, FormModalHeader } from "@/components/common/form-modal"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "Excluir usuário" — título do modal. */
  title: string
  /** "o usuário" / "o grupo" — entra na frase de confirmação. */
  subject: string
  /** Nome do registro, em negrito na frase. */
  itemName: string
  onConfirm: () => void
  isLoading?: boolean
}

/**
 * Confirmação de exclusão — UM componente para todo módulo (era um arquivo por
 * domínio, idênticos). Mesmo molde dos modais do painel (`FormModal`), botão
 * vermelho. Normalmente vem pronto do `useResourceList` (`remove.dialogProps`).
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  subject,
  itemName,
  onConfirm,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={title} size="md">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormModalHeader
          icon={Trash2}
          title={title}
          description="Esta ação não pode ser desfeita"
          onClose={() => onOpenChange(false)}
          disabled={isLoading}
        />
        <p className="px-6 py-5 text-sm text-muted-foreground">
          Tem certeza que deseja excluir {subject}{" "}
          <span className="font-semibold text-foreground">{itemName}</span>?
        </p>
        <FormModalFooter
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          submitLabel="Excluir"
          loadingLabel="Excluindo..."
          destructive
        />
      </form>
    </FormModal>
  )
}
