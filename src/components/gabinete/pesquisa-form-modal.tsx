"use client"

import * as React from "react"
import { toast } from "sonner"
import { ClipboardList, Plus, Trash2 } from "lucide-react"

import { FORM_MODAL_BODY, FormModal, FormModalFooter, FormModalHeader } from "@/components/common/form-modal"
import { InfoHint } from "@/components/common/info-hint"
import { TagPicker } from "@/components/common/tag-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Pergunta, Pesquisa } from "@/data/tipos"
import { novoId, useGabineteStore } from "@/store/gabinete-store"

interface PerguntaEditando extends Omit<Pergunta, "opcoes"> {
  /** Uma opção por linha. */
  opcoesTexto: string
}

function perguntaVazia(): PerguntaEditando {
  return { id: novoId("q"), texto: "", tipo: "escolha", opcoesTexto: "", obrigatoria: true }
}

export function PesquisaFormModal({
  open,
  onOpenChange,
  pesquisa,
  onSalva,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Sem pesquisa = cadastro. */
  pesquisa?: Pesquisa | null
  onSalva?: (p: Pesquisa) => void
}) {
  const criarPesquisa = useGabineteStore((s) => s.criarPesquisa)
  const editarPesquisa = useGabineteStore((s) => s.editarPesquisa)

  const [titulo, setTitulo] = React.useState("")
  const [descricao, setDescricao] = React.useState("")
  const [ativa, setAtiva] = React.useState(true)
  const [perguntas, setPerguntas] = React.useState<PerguntaEditando[]>([perguntaVazia()])
  const [erros, setErros] = React.useState<Record<string, string>>({})

  // Recarrega o formulário a cada abertura.
  const [abertoAntes, setAbertoAntes] = React.useState(false)
  if (open !== abertoAntes) {
    setAbertoAntes(open)
    if (open) {
      setTitulo(pesquisa?.titulo ?? "")
      setDescricao(pesquisa?.descricao ?? "")
      setAtiva(pesquisa?.ativa ?? true)
      setPerguntas(
        pesquisa?.perguntas.length
          ? pesquisa.perguntas.map((p) => ({ ...p, opcoesTexto: p.opcoes.join("\n") }))
          : [perguntaVazia()]
      )
      setErros({})
    }
  }

  function mudar(id: string, dados: Partial<PerguntaEditando>) {
    setPerguntas((lista) => lista.map((p) => (p.id === id ? { ...p, ...dados } : p)))
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    const novosErros: Record<string, string> = {}
    if (!titulo.trim()) novosErros.titulo = "Dê um título para a pesquisa"
    perguntas.forEach((p) => {
      if (!p.texto.trim()) novosErros[p.id] = "Escreva a pergunta"
      else if (p.tipo === "escolha" && opcoesDe(p).length < 2) novosErros[p.id] = "Coloque pelo menos duas opções"
    })
    setErros(novosErros)
    if (Object.keys(novosErros).length) return

    const dados = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      ativa,
      perguntas: perguntas.map<Pergunta>((p) => ({
        id: p.id,
        texto: p.texto.trim(),
        tipo: p.tipo,
        opcoes: p.tipo === "escolha" ? opcoesDe(p) : [],
        obrigatoria: p.obrigatoria,
      })),
    }
    if (pesquisa) {
      editarPesquisa(pesquisa.id, dados)
      toast.success("Pesquisa atualizada")
      onSalva?.({ ...pesquisa, ...dados })
    } else {
      const nova = criarPesquisa(dados)
      toast.success("Pesquisa criada — copie o link e mande para a população")
      onSalva?.(nova)
    }
    onOpenChange(false)
  }

  const titulo_modal = pesquisa ? "Editar pesquisa" : "Nova pesquisa"

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title={titulo_modal} tall>
      <form onSubmit={salvar} className="flex min-h-0 flex-1 flex-col">
        <FormModalHeader
          icon={ClipboardList}
          title={titulo_modal}
          description="Nome, endereço e CEP já vêm no formulário — aqui entram só as suas perguntas"
          onClose={() => onOpenChange(false)}
        />
        <div className={FORM_MODAL_BODY}>
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Prioridades do seu bairro" />
            {erros.titulo && <p className="text-xs text-destructive">{erros.titulo}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="flex items-center gap-1.5">
              Texto de abertura
              <InfoHint>Aparece no topo do formulário, embaixo do título.</InfoHint>
            </Label>
            <Textarea
              id="descricao"
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: Queremos saber o que mais precisa de atenção perto da sua casa."
            />
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium">Perguntas</p>
            {perguntas.map((p, i) => (
              <div key={p.id} className="space-y-3 border-l-2 border-blue-500/40 pl-4">
                <div className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-semibold tabular-nums text-muted-foreground">{i + 1}.</span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Input
                      value={p.texto}
                      onChange={(e) => mudar(p.id, { texto: e.target.value })}
                      placeholder="Escreva a pergunta"
                      aria-label={`Pergunta ${i + 1}`}
                    />
                    {erros[p.id] && <p className="text-xs text-destructive">{erros[p.id]}</p>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={perguntas.length === 1}
                    onClick={() => setPerguntas((l) => l.filter((x) => x.id !== p.id))}
                    aria-label="Remover pergunta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pl-5">
                  <TagPicker
                    label="Tipo de resposta"
                    value={p.tipo}
                    onChange={(v) => mudar(p.id, { tipo: v as Pergunta["tipo"] })}
                    options={[
                      { value: "escolha", label: "Escolher uma opção" },
                      { value: "texto", label: "Texto livre" },
                    ]}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={p.obrigatoria} onCheckedChange={(v) => mudar(p.id, { obrigatoria: v })} />
                    Obrigatória
                  </label>
                </div>
                {p.tipo === "escolha" && (
                  <div className="space-y-1.5 pl-5">
                    <Label className="text-xs text-muted-foreground">Opções — uma por linha</Label>
                    <Textarea
                      rows={4}
                      value={p.opcoesTexto}
                      onChange={(e) => mudar(p.id, { opcoesTexto: e.target.value })}
                      placeholder={"Saúde\nSegurança\nIluminação"}
                    />
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setPerguntas((l) => [...l, perguntaVazia()])}>
              <Plus className="h-4 w-4" />
              Adicionar pergunta
            </Button>
          </div>
        </div>
        <FormModalFooter onCancel={() => onOpenChange(false)} submitLabel={pesquisa ? "Salvar" : "Criar pesquisa"}>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={ativa} onCheckedChange={setAtiva} />
            Recebendo respostas
          </label>
        </FormModalFooter>
      </form>
    </FormModal>
  )
}

function opcoesDe(p: PerguntaEditando): string[] {
  return [...new Set(p.opcoesTexto.split("\n").map((o) => o.trim()).filter(Boolean))]
}
