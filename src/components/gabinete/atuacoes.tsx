"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Baby,
  FileText,
  HandHeart,
  HandHelping,
  HeartPulse,
  Lightbulb,
  Search,
  Shovel,
  Sparkles,
} from "lucide-react"

import { FORM_MODAL_BODY, FormModal, FormModalFooter, FormModalHeader } from "@/components/common/form-modal"
import { TagPicker } from "@/components/common/tag-picker"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pessoinha } from "@/components/gabinete/pecas"
import { CATEGORIAS_ATUACAO } from "@/data/seed"
import type { Atuacao, SituacaoAtuacao } from "@/data/tipos"
import { formatDay } from "@/lib/format"
import { normalizar } from "@/lib/geo"
import { cn } from "@/lib/utils"
import { useGabineteStore } from "@/store/gabinete-store"

/** Ícone + cor de cada categoria (cor com significado: saúde vermelho, obra laranja, luz âmbar...). */
const ESTILO: Record<string, { icone: React.ElementType; cor: string }> = {
  Saúde: { icone: HeartPulse, cor: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  "Obra / buraco": { icone: Shovel, cor: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  Iluminação: { icone: Lightbulb, cor: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  Documentação: { icone: FileText, cor: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  "Vaga em creche/escola": { icone: Baby, cor: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  "Assistência social": { icone: HandHeart, cor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
}
const PADRAO = { icone: Sparkles, cor: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" }

export function IconeCategoria({ categoria, className }: { categoria: string; className?: string }) {
  const { icone: Icone, cor } = ESTILO[categoria] ?? PADRAO
  return (
    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cor, className)}>
      <Icone className="h-4 w-4" strokeWidth={1.75} />
    </span>
  )
}

export function SituacaoAtuacaoBadge({ situacao }: { situacao: SituacaoAtuacao }) {
  const feita = situacao === "concluida"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        feita
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", feita ? "bg-emerald-500" : "bg-orange-500")} />
      {feita ? "Concluída" : "Em andamento"}
    </span>
  )
}

/** Uma linha do histórico (ficha da pessoa e lista do módulo). */
export function LinhaAtuacao({ atuacao, onClick }: { atuacao: Atuacao; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-start gap-3 py-2.5 text-left hover:bg-muted/40">
      <IconeCategoria categoria={atuacao.categoria} />
      <div className="min-w-0 flex-1">
        <p className="text-sm">{atuacao.descricao}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {atuacao.categoria} · {formatDay(atuacao.data)}
          <SituacaoAtuacaoBadge situacao={atuacao.situacao} />
        </p>
      </div>
    </button>
  )
}

function hoje() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/**
 * Registrar/editar atuação. Com `pessoaId` a pessoa vem travada (aberto da
 * ficha); sem, escolhe-se a pessoa por busca (aberto do módulo).
 */
export function AtuacaoFormModal({
  open,
  onOpenChange,
  atuacao,
  pessoaId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  atuacao?: Atuacao | null
  pessoaId?: string | null
}) {
  const respostas = useGabineteStore((s) => s.respostas)
  const registrarAtuacao = useGabineteStore((s) => s.registrarAtuacao)
  const editarAtuacao = useGabineteStore((s) => s.editarAtuacao)
  const excluirAtuacao = useGabineteStore((s) => s.excluirAtuacao)

  const [pessoa, setPessoa] = React.useState<string>("")
  const [busca, setBusca] = React.useState("")
  const [categoria, setCategoria] = React.useState(CATEGORIAS_ATUACAO[0])
  const [descricao, setDescricao] = React.useState("")
  const [situacao, setSituacao] = React.useState<SituacaoAtuacao>("andamento")
  const [data, setData] = React.useState(hoje())
  const [erro, setErro] = React.useState("")
  const [confirmando, setConfirmando] = React.useState(false)

  const [abertoAntes, setAbertoAntes] = React.useState(false)
  if (open !== abertoAntes) {
    setAbertoAntes(open)
    if (open) {
      setPessoa(atuacao?.pessoaId ?? pessoaId ?? "")
      setBusca("")
      setCategoria(atuacao?.categoria ?? CATEGORIAS_ATUACAO[0])
      setDescricao(atuacao?.descricao ?? "")
      setSituacao(atuacao?.situacao ?? "andamento")
      setData(atuacao?.data ?? hoje())
      setErro("")
      setConfirmando(false)
    }
  }

  const escolhida = respostas.find((r) => r.id === pessoa)
  const travada = !!atuacao || !!pessoaId
  const sugestoes = React.useMemo(() => {
    const q = normalizar(busca)
    if (q.length < 2) return []
    return respostas.filter((r) => normalizar(`${r.nome} ${r.bairro}`).includes(q)).slice(0, 6)
  }, [busca, respostas])

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!pessoa) return setErro("Escolha a pessoa")
    if (!descricao.trim()) return setErro("Descreva o que foi feito")
    const dados = { pessoaId: pessoa, categoria, descricao: descricao.trim(), situacao, data }
    if (atuacao) editarAtuacao(atuacao.id, dados)
    else registrarAtuacao(dados)
    toast.success(atuacao ? "Atuação atualizada" : "Atuação registrada")
    onOpenChange(false)
  }

  const titulo = atuacao ? "Editar atuação" : "Registrar atuação"

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={titulo}>
      <form onSubmit={salvar} className="flex min-h-0 flex-1 flex-col">
        <FormModalHeader
          icon={HandHelping}
          title={titulo}
          description="O que o gabinete fez por esta pessoa"
          onClose={() => onOpenChange(false)}
        />
        <div className={FORM_MODAL_BODY}>
          <div className="space-y-1.5">
            <Label>Pessoa</Label>
            {escolhida ? (
              <div className="flex items-center gap-3">
                <Pessoinha nome={escolhida.nome} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{escolhida.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {escolhida.rua}
                    {escolhida.numero ? `, ${escolhida.numero}` : ""} · {escolhida.bairro}
                  </p>
                </div>
                {!travada && (
                  <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setPessoa("")}>
                    trocar
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome ou bairro"
                    className="pl-9"
                    autoFocus
                  />
                </div>
                {sugestoes.length > 0 && (
                  <ul className="divide-y rounded-md border">
                    {sugestoes.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => setPessoa(r.id)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50"
                        >
                          <Pessoinha nome={r.nome} className="h-7 w-7" />
                          <span className="min-w-0 flex-1 truncate text-sm">{r.nome}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{r.bairro}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <TagPicker
              label="Tipo de atuação"
              value={categoria}
              onChange={setCategoria}
              options={CATEGORIAS_ATUACAO.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">O que foi feito</Label>
            <Textarea
              id="descricao"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: Pedido de troca de lâmpada protocolado na prefeitura."
            />
          </div>

          <div className="flex flex-wrap items-end gap-5">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <DatePicker value={data} onChange={(d) => d && setData(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`)} />
            </div>
            <div className="space-y-1.5">
              <Label>Situação</Label>
              <TagPicker
                label="Situação"
                value={situacao}
                onChange={(v) => setSituacao(v as SituacaoAtuacao)}
                options={[
                  { value: "andamento", label: "Em andamento" },
                  { value: "concluida", label: "Concluída" },
                ]}
              />
            </div>
          </div>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
        </div>
        <FormModalFooter onCancel={() => onOpenChange(false)} submitLabel={atuacao ? "Salvar" : "Registrar"}>
          {atuacao && (
            <button
              type="button"
              className="text-sm text-destructive hover:underline"
              onClick={() => {
                // dois cliques: o primeiro só pede confirmação
                if (!confirmando) return setConfirmando(true)
                excluirAtuacao(atuacao.id)
                toast.success("Atuação excluída")
                onOpenChange(false)
              }}
            >
              {confirmando ? "Clique de novo para excluir" : "Excluir"}
            </button>
          )}
        </FormModalFooter>
      </form>
    </FormModal>
  )
}
