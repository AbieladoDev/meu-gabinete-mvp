"use client"

import { cn } from "@/lib/utils"

export interface TagOption {
  value: string
  label: string
}

/**
 * Escolha ÚNICA em etiquetas — o padrão do painel no lugar do `Select`
 * (pedido do Arthur: as opções ficam à vista, sem abrir nada). Desenho do
 * degasBeer-admin. Para listas longas (mais de ~12 opções), aí sim `Select`.
 */
export function TagPicker({
  options,
  value,
  onChange,
  disabled,
  label,
  emptyText = "Nenhuma opção cadastrada.",
}: {
  options: TagOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Nome do grupo para leitor de tela. */
  label: string
  emptyText?: string
}) {
  if (options.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyText}</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
              active ? "border-foreground bg-foreground text-background" : "hover:bg-muted"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
