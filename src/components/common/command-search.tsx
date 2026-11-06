"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ClipboardList,
  Clock,
  HandHelping,
  Landmark,
  LayoutDashboard,
  Map as MapIcon,
  Plus,
  Search,
  UsersRound,
  X,
} from "lucide-react"

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SUPERFICIE_DA_BARRA } from "@/components/layout/superficie-da-barra"
import { useAuthStore } from "@/store/auth-store"
import { useGabineteStore } from "@/store/gabinete-store"
import { cn } from "@/lib/utils"

/**
 * A busca do cabeçalho — desenho do `todosDan-client` (padrão da casa desde
 * 31/10/2026): campo em pílula
 * no centro do cabeçalho, painel ancorado ABAIXO dele (não modal no meio da
 * tela), `Ctrl/⌘+K`, buscas recentes e esqueleto enquanto busca.
 *
 * No template ela alcança USUÁRIOS (a lista inteira de `GET /user`, filtrada
 * aqui — a API do template não tem `q`), mais as páginas e ações. Módulo
 * novo com registros entra em `useBuscaDeRegistros` e em `searchData`.
 */

interface SearchLink {
  title: string
  url: string
  icon: React.ElementType
  keywords?: string[]
  permission?: string
}

interface SearchCategory {
  title: string
  links: SearchLink[]
}

const searchData: SearchCategory[] = [
  {
    title: "Páginas",
    links: [
      { title: "Início", url: "/", icon: LayoutDashboard, keywords: ["home", "inicio", "dashboard"] },
      { title: "Mapa", url: "/mapa", icon: MapIcon, keywords: ["mapa", "calor", "onde", "bairros"] },
      { title: "Pesquisas", url: "/pesquisas", icon: ClipboardList, keywords: ["formulario", "link", "questionario"] },
      { title: "Pessoas", url: "/pessoas", icon: UsersRound, keywords: ["respostas", "moradores", "apoiadores"] },
      { title: "Atuações", url: "/atuacoes", icon: HandHelping, keywords: ["historico", "atendimento", "encaminhamento", "pedido"] },
      { title: "Meu gabinete", url: "/gabinete", icon: Landmark, keywords: ["vereador", "cidade", "configuracoes", "perfil"] },
    ],
  },
  {
    title: "Ações rápidas",
    links: [
      { title: "Nova pesquisa", url: "/pesquisas?nova=1", icon: Plus, keywords: ["criar pesquisa", "novo formulario"] },
      { title: "Registrar atuação", url: "/atuacoes?nova=1", icon: Plus, keywords: ["nova atuacao", "atendimento", "historico"] },
    ],
  },
]

// ---------------------------------------------------------------------------
// Busca de registros (no store do MVP)
// ---------------------------------------------------------------------------

interface Resultado {
  key: string
  grupo: "Pesquisas" | "Pessoas"
  titulo: string
  detalhe?: string
  url: string
}

const MINIMO = 2
const MAXIMO_POR_GRUPO = 5

function useBuscaDeRegistros(termo: string) {
  const pesquisas = useGabineteStore((s) => s.pesquisas)
  const respostas = useGabineteStore((s) => s.respostas)
  const resultados = React.useMemo<Resultado[]>(() => {
    const q = normalizar(termo)
    if (q.length < MINIMO) return []
    const ps = pesquisas
      .filter((p) => normalizar(p.titulo).includes(q))
      .slice(0, MAXIMO_POR_GRUPO)
      .map((p) => ({ key: "p-" + p.id, grupo: "Pesquisas" as const, titulo: p.titulo, detalhe: p.ativa ? "Ativa" : "Encerrada", url: "/pesquisas/" + p.id }))
    const pe = respostas
      .filter((r) => normalizar(r.nome + " " + r.bairro + " " + r.rua).includes(q))
      .slice(0, MAXIMO_POR_GRUPO)
      .map((r) => ({ key: "r-" + r.id, grupo: "Pessoas" as const, titulo: r.nome, detalhe: r.bairro, url: "/pessoas?id=" + r.id }))
    return [...ps, ...pe]
  }, [termo, pesquisas, respostas])
  return { resultados, buscando: false }
}

const ICONE_DO_GRUPO: Record<Resultado["grupo"], React.ElementType> = {
  Pesquisas: ClipboardList,
  Pessoas: UsersRound,
}

// ---------------------------------------------------------------------------
// Buscas recentes (conveniência do dispositivo, não conteúdo)
// ---------------------------------------------------------------------------

const CHAVE_RECENTES = "painel:buscas-recentes"
const MAX_RECENTES = 6

function useBuscasRecentes() {
  const [recentes, setRecentes] = React.useState<string[]>([])

  React.useEffect(() => {
    try {
      const cru = window.localStorage.getItem(CHAVE_RECENTES)
      if (cru) setRecentes(JSON.parse(cru) as string[])
    } catch {
      // storage bloqueado: segue sem histórico
    }
  }, [])

  const registrar = React.useCallback((termo: string) => {
    const t = termo.trim()
    if (t.length < MINIMO) return
    setRecentes((atual) => {
      const novo = [t, ...atual.filter((i) => i !== t)].slice(0, MAX_RECENTES)
      try {
        window.localStorage.setItem(CHAVE_RECENTES, JSON.stringify(novo))
      } catch {
        // idem
      }
      return novo
    })
  }, [])

  const limpar = React.useCallback(() => {
    setRecentes([])
    try {
      window.localStorage.removeItem(CHAVE_RECENTES)
    } catch {
      // idem
    }
  }, [])

  return { recentes, registrar, limpar }
}

function useIsMac() {
  const [isMac, setIsMac] = React.useState(false)
  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])
  return isMac
}

function normalizar(v: string): string {
  return v.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

// ---------------------------------------------------------------------------
// Campo do cabeçalho
// ---------------------------------------------------------------------------

function CommandSearchTrigger({
  aberto,
  termo,
  onTermo,
  onAbrir,
  onFechar,
  inputRef,
  noPainel,
  modulo,
}: {
  /** No CABEÇALHO DO MÓDULO (30/10/2026, igual ao client): mais alto, mais largo, cantos rounded-md. */
  modulo?: boolean
  /** No topo do PAINEL lateral (23/10/2026): campo da largura do painel. */
  noPainel?: boolean
  aberto: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
  termo: string
  onTermo: (v: string) => void
  onAbrir: () => void
  onFechar: () => void
}) {
  const isMac = useIsMac()
  const atalho = isMac ? "⌘K" : "Ctrl+K"

  return (
    <div className="flex w-full justify-center">
      {/* Celular: só o ícone. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onAbrir}
            aria-label="Buscar"
            className="bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors md:hidden"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="flex items-center gap-2">
            <span>Buscar</span>
            <Kbd>{atalho}</Kbd>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Desktop: o campo inteiro, que cresce para os dois lados ao abrir. */}
      <div
        className={cn(
          /* Cantos `rounded-lg` (23/10/2026: era pílula; o Arthur pediu mais quadrado, igual aos botões do trilho). */
          "hidden items-center gap-2.5 px-3 transition-all duration-200 md:flex",
          modulo ? "h-9 rounded-md" : "h-8 rounded-lg",
          "bg-sidebar-accent/70 ring-1",
          aberto
            ? cn("w-full ring-sidebar-foreground/25", !noPainel && (modulo ? "md:w-[42rem]" : "md:w-[40rem]"))
            : cn("w-full ring-transparent hover:bg-sidebar-accent", !noPainel && (modulo ? "md:w-[34rem]" : "md:w-[30rem]"))
        )}
      >
        <Search
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            aberto ? "text-sidebar-foreground" : "text-sidebar-foreground/60"
          )}
          strokeWidth={1.5}
        />
        <input
          ref={inputRef}
          value={termo}
          onChange={(e) => {
            onTermo(e.target.value)
            if (!aberto) onAbrir()
          }}
          onFocus={onAbrir}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onFechar()
              e.currentTarget.blur()
            }
          }}
          placeholder="Buscar pessoa, página…"
          className="placeholder:text-sidebar-foreground/60 text-sidebar-foreground h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {termo ? (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => onTermo("")}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Kbd className="border-sidebar-border bg-sidebar text-sidebar-foreground/60 shrink-0">
            {atalho}
          </Kbd>
        )}
      </div>
    </div>
  )
}

export function CommandSearch({
  noPainel = false,
  modulo = false,
}: { noPainel?: boolean; modulo?: boolean } = {}) {
  const [open, setOpen] = React.useState(false)
  const [termo, setTermo] = React.useState("")
  const campo = React.useRef<HTMLDivElement>(null)
  const inputEl = React.useRef<HTMLInputElement>(null)
  const { recentes, registrar, limpar } = useBuscasRecentes()
  const router = useRouter()
  const { hasPermission } = useAuthStore()
  const { resultados, buscando } = useBuscaDeRegistros(termo)

  React.useEffect(() => {
    if (open) inputEl.current?.focus()
  }, [open])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "KeyK" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = React.useCallback(
    (url: string) => {
      setOpen(false)
      registrar(termo)
      setTermo("")
      router.push(url)
    },
    [router, registrar, termo]
  )

  const paginas = React.useMemo(() => {
    const q = normalizar(termo)
    return searchData
      .map((category) => ({
        ...category,
        links: category.links.filter(
          (link) =>
            (!link.permission || hasPermission(link.permission)) &&
            (!q ||
              normalizar(`${link.title} ${link.keywords?.join(" ") ?? ""}`).includes(q))
        ),
      }))
      .filter((category) => category.links.length > 0)
  }, [hasPermission, termo])

  const grupos = React.useMemo(
    () =>
      (["Pesquisas", "Pessoas"] as const)
        .map((grupo) => ({
          grupo,
          itens: resultados.filter((r) => r.grupo === grupo),
        }))
        .filter((g) => g.itens.length > 0),
    [resultados]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={campo} className="w-full">
          <CommandSearchTrigger
            inputRef={inputEl}
            aberto={open}
            termo={termo}
            onTermo={setTermo}
            onAbrir={() => setOpen(true)}
            onFechar={() => setOpen(false)}
            noPainel={noPainel}
            modulo={modulo}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        /* No painel o campo é estreito: a lista abre para a direita, por cima do conteúdo. */
        align={noPainel ? "start" : "center"}
        sideOffset={modulo ? 6 : 8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (campo.current?.contains(e.target as Node)) e.preventDefault()
        }}
        className={cn(
          "w-[calc(100vw-2rem)] overflow-hidden p-0",
          /* No cabeçalho do módulo a largura É a do campo (a âncora), como no client. */
          modulo ? "md:w-(--radix-popover-trigger-width) rounded-md" : "md:w-[40rem]",
          SUPERFICIE_DA_BARRA
        )}
      >
        <Command
          shouldFilter={false}
          className="bg-transparent text-inherit [&_[cmdk-group]]:text-sidebar-foreground [&_[cmdk-group-heading]]:text-sidebar-foreground/60 [&_[cmdk-item][data-selected=true]]:bg-sidebar-accent [&_[cmdk-item][data-selected=true]]:text-sidebar-accent-foreground **:data-[slot=command-input-wrapper]:hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5"
        >
          {/* O input do cmdk fica escondido: quem se digita é o campo do
              cabeçalho. Sem ele o Command perde a navegação por seta. */}
          <CommandInput
            value={termo}
            onValueChange={setTermo}
            className="sr-only"
            placeholder="Buscar"
          />
          <CommandList className="barra-fantasma max-h-[420px]">
            {!termo.trim() && recentes.length > 0 && (
              <CommandGroup
                heading={
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Buscas recentes
                    </span>
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={limpar}
                      className="hover:text-sidebar-foreground cursor-pointer text-[11px] font-normal"
                    >
                      limpar
                    </span>
                  </span>
                }
              >
                {recentes.map((r) => (
                  <CommandItem
                    key={r}
                    value={`recente-${r}`}
                    onSelect={() => setTermo(r)}
                    className="group cursor-pointer"
                  >
                    <Clock className="text-sidebar-foreground/60 mr-2 h-4 w-4" />
                    <span className="truncate">{r}</span>
                    <ArrowRight className="text-sidebar-foreground/60 ml-auto h-4 w-4 opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {buscando && (
              <div className="space-y-1 p-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 px-2 py-2">
                    <Skeleton className="size-8 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!buscando && (
              <CommandEmpty>
                {termo.trim().length >= MINIMO
                  ? "Nenhum resultado encontrado."
                  : "Digite para buscar pessoa ou página…"}
              </CommandEmpty>
            )}

            {/* Registros antes das páginas: quem busca um nome quer o registro. */}
            {grupos.map(({ grupo, itens }) => {
              const Icone = ICONE_DO_GRUPO[grupo]
              return (
                <CommandGroup
                  key={grupo}
                  heading={
                    <span className="flex items-center gap-1.5">
                      <Icone className="h-3 w-3" />
                      {grupo}
                      <span className="tabular-nums opacity-60">{itens.length}</span>
                    </span>
                  }
                >
                  {itens.map((r) => (
                    <CommandItem
                      key={r.key}
                      value={r.key}
                      onSelect={() => handleSelect(r.url)}
                      className="group cursor-pointer gap-2.5"
                    >
                      <span className="bg-sidebar-accent text-sidebar-foreground/70 flex size-8 shrink-0 items-center justify-center rounded-md">
                        <Icone className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{r.titulo}</span>
                        {r.detalhe && (
                          <span className="text-sidebar-foreground/60 block truncate text-xs">
                            {r.detalhe}
                          </span>
                        )}
                      </span>
                      <ArrowRight className="text-sidebar-foreground/60 ml-2 h-4 w-4 shrink-0 opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}

            {grupos.length > 0 && paginas.length > 0 && (
              <CommandSeparator className="bg-sidebar-border mx-0" />
            )}

            {paginas.map((category, index) => (
              <React.Fragment key={category.title}>
                {index > 0 && <CommandSeparator className="bg-sidebar-border mx-0" />}
                <CommandGroup heading={category.title}>
                  {category.links.map((link) => (
                    <CommandItem
                      key={link.url}
                      value={`${link.title} ${link.keywords?.join(" ") || ""}`}
                      onSelect={() => handleSelect(link.url)}
                      className="group cursor-pointer"
                    >
                      <link.icon
                        className="text-sidebar-foreground/60 mr-2 h-4 w-4"
                        strokeWidth={1.5}
                      />
                      <span>{link.title}</span>
                      <ArrowRight className="text-sidebar-foreground/60 ml-auto h-4 w-4 opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
