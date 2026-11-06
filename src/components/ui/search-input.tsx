"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Largura/posição do campo ABERTO. Fechado, é só o botão redondo. */
  className?: string
  /**
   * Fechada por padrão (08/10, pedido do Arthur, vale para todos os módulos):
   * só a lupa redonda; clicar abre o campo. Com texto fica aberta; vazia, fecha
   * ao sair. `false` deixa sempre aberta (PDV: o leitor de código de barras
   * precisa do campo à vista).
   */
  collapsible?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  collapsible = true,
}: SearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [expanded, setExpanded] = React.useState(false)
  const open = !collapsible || expanded || value.length > 0

  // Abriu pelo botão: o cursor já vai para o campo.
  React.useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  const handleClear = () => {
    onChange("")
    inputRef.current?.focus()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={placeholder}
        title={placeholder}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:h-9 md:w-9"
      >
        <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </button>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2 md:left-3 top-1/2 h-3.5 w-3.5 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (collapsible && !value) setExpanded(false)
        }}
        onKeyDown={(e) => {
          if (collapsible && e.key === "Escape") {
            onChange("")
            setExpanded(false)
          }
        }}
        placeholder={placeholder}
        className={cn(
          "h-7 md:h-9 w-full border border-border bg-background pl-7 md:pl-9 pr-7 md:pr-9 text-xs md:text-sm",
          collapsible ? "rounded-full" : "rounded-lg",
          "placeholder:text-muted-foreground",
          // Sem anel colorido no foco (08/10): só a borda fica um pouco mais escura.
          "focus:outline-none focus:border-foreground/30",
          "transition-all duration-200"
        )}
      />
      {value && (
        <button
          type="button"
          // mousedown: limpa antes do blur fechar o campo.
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
          className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 md:p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
        </button>
      )}
    </div>
  )
}
