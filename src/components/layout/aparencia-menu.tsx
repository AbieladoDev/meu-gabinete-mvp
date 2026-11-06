"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Check, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  aplicarBarraClara,
  gravarBarraClara,
  lerBarraClara,
  MODO_PADRAO,
  type ModoDaBarra,
} from "@/lib/barra-clara"
import { cn } from "@/lib/utils"
import { useAparenciaStore } from "@/store/aparencia-store"

type Tema = "light" | "dark"

/**
 * AS QUATRO CARAS DO PAINEL — tema × navegação, as mesmas da tabela da
 * armadilha -1 do CLAUDE.md. Cada cartão desenha a cara em miniatura.
 *
 * ⚠️ As cores das MINIATURAS são hex fixos de propósito: é um DESENHO de como a
 * tela fica, e precisa mostrar o tema escuro mesmo com o painel no claro (e
 * vice-versa). Token do tema atual desenharia sempre a cara de agora.
 */
const OPCOES: {
  tema: Tema
  barra: ModoDaBarra
  rotulo: string
  descricao: string
  /** fundo da página · barra · conteúdo (cartões) · traço */
  cores: { pagina: string; barra: string; bloco: string; traco: string }
}[] = [
  {
    tema: "light",
    barra: "uniforme",
    rotulo: "Claro",
    descricao: "Tudo claro, navegação da cor do conteúdo.",
    cores: { pagina: "#ffffff", barra: "#ffffff", bloco: "#eef0f3", traco: "#dfe2e7" },
  },
  {
    tema: "light",
    barra: "contraste",
    rotulo: "Claro com contraste",
    descricao: "Barra escura ao lado do conteúdo claro.",
    cores: { pagina: "#ffffff", barra: "#0e0e10", bloco: "#eef0f3", traco: "#dfe2e7" },
  },
  {
    tema: "dark",
    barra: "uniforme",
    rotulo: "Escuro",
    descricao: "Tudo escuro, navegação da cor do conteúdo.",
    cores: { pagina: "#09090b", barra: "#09090b", bloco: "#1c1c20", traco: "#27272a" },
  },
  {
    tema: "dark",
    barra: "contraste",
    rotulo: "Escuro com contraste",
    descricao: "Barra um degrau acima do conteúdo.",
    cores: { pagina: "#09090b", barra: "#1f1f23", bloco: "#1c1c20", traco: "#27272a" },
  },
]

/** A miniatura: janela com os três pontinhos, barra lateral e blocos. */
function Miniatura({ cores }: { cores: (typeof OPCOES)[number]["cores"] }) {
  return (
    <div
      aria-hidden
      className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border"
      style={{ background: cores.pagina, borderColor: cores.traco }}
    >
      <div className="flex h-4 items-center gap-1 px-2" style={{ background: cores.barra }}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex h-[calc(100%-1rem)]">
        <div
          className="flex w-1/4 flex-col gap-1.5 border-r p-2"
          style={{ background: cores.barra, borderColor: cores.traco }}
        >
          {[70, 55, 80, 50].map((w) => (
            <span
              key={w}
              className="h-1.5 rounded-full"
              style={{ width: `${w}%`, background: cores.traco }}
            />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-2.5">
          <span className="h-2 w-1/3 rounded-full" style={{ background: cores.traco }} />
          <div className="grid flex-1 grid-cols-2 gap-2">
            <span className="rounded-md" style={{ background: cores.bloco }} />
            <span className="rounded-md" style={{ background: cores.bloco }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * A APARÊNCIA num MODAL com as caras desenhadas (21/09/2026, pedido do Arthur,
 * a partir de uma referência): quatro cartões com miniatura — tema claro ou
 * escuro, cada um com a navegação uniforme ou em contraste — e um interruptor
 * para acompanhar o tema do sistema. Nada muda até "Salvar alterações":
 * "Cancelar" deixa tudo como estava.
 *
 * Era um popover com duas listas de texto (Tema, Contraste), em que era
 * preciso imaginar o resultado de cada combinação.
 *
 * ⚠️ Tema vai para o next-themes; navegação para o `localStorage`
 * (`lib/barra-clara.ts`). Nenhum dos dois vai para a API.
 */
export function AparenciaMenu({
  className,
  semGatilho = false,
}: {
  className?: string
  /**
   * Só o modal, sem o botão redondo (22/10/2026, igual ao client): o lápis
   * saiu do cabeçalho e quem abre é o item "Aparência" do menu do usuário,
   * pelo `useAparenciaStore`. Montado assim na casca (`painel-shell.tsx`).
   */
  semGatilho?: boolean
}) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [aberto, setAberto] = React.useState(false)

  /* O RASCUNHO: o que está marcado no modal, antes de salvar. */
  const [tema, setTema] = React.useState<Tema>("light")
  const [sistema, setSistema] = React.useState(false)
  const [barra, setBarra] = React.useState<ModoDaBarra>(MODO_PADRAO)

  function abrir() {
    /* Ao abrir, o rascunho parte do que está valendo agora. */
    setSistema(theme === "system")
    setTema(resolvedTheme === "dark" ? "dark" : "light")
    setBarra(lerBarraClara())
    setAberto(true)
  }

  function salvar() {
    setTheme(sistema ? "system" : tema)
    aplicarBarraClara(barra)
    gravarBarraClara(barra)
    setAberto(false)
  }

  /* O item "Aparência" do menu do usuário abre ESTE modal. O contador começa
     em 0 — só reage a pedido de verdade, não à montagem. */
  const pedido = useAparenciaStore((s) => s.pedido)
  const pedidoAtendido = React.useRef(pedido)
  React.useEffect(() => {
    if (pedido === pedidoAtendido.current) return
    pedidoAtendido.current = pedido
    abrir()
  })

  return (
    <>
      {!semGatilho && (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Aparência"
            onClick={abrir}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground/80 transition-colors hover:bg-sidebar-foreground hover:text-sidebar",
              aberto && "bg-sidebar-foreground text-sidebar",
              className
            )}
          >
            <Palette className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Aparência</TooltipContent>
      </Tooltip>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <div className="space-y-1 px-6 pt-6">
            <DialogTitle className="text-xl">Aparência</DialogTitle>
            <DialogDescription>
              Como o painel fica neste computador.
            </DialogDescription>
          </div>

          <div className="grid gap-x-4 gap-y-5 px-6 py-6 sm:grid-cols-2">
            {OPCOES.map((o) => {
              /* Com "acompanhar o sistema", o tema dos cartões é o que o
                 sistema está usando agora — só a navegação é escolha. */
              const escolhido = o.tema === tema && o.barra === barra
              return (
                <button
                  key={`${o.tema}-${o.barra}`}
                  type="button"
                  aria-pressed={escolhido}
                  onClick={() => {
                    setTema(o.tema)
                    setBarra(o.barra)
                    if (sistema && o.tema !== tema) setSistema(false)
                  }}
                  className="group text-left"
                >
                  <div
                    className={cn(
                      "rounded-xl border-2 p-1.5 transition-colors",
                      escolhido
                        ? "border-primary"
                        : "border-transparent group-hover:border-border"
                    )}
                  >
                    <Miniatura cores={o.cores} />
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-2 px-1">
                    <span>
                      <span className="block text-sm font-semibold">{o.rotulo}</span>
                      <span className="block text-xs text-muted-foreground">
                        {o.descricao}
                      </span>
                    </span>
                    {escolhido && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-6 py-4">
            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={sistema} onCheckedChange={setSistema} />
              Acompanhar o tema do sistema
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvar}>Salvar alterações</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
