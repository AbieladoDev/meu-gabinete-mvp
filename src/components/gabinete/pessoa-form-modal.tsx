"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"

import { FORM_MODAL_BODY, FormModal, FormModalFooter, FormModalHeader } from "@/components/common/form-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Resposta } from "@/data/tipos"
import { buscarCep, espalhar, geocodificar } from "@/lib/endereco"
import { formatPhone, formatZipCode } from "@/lib/geo"
import { useGabineteStore } from "@/store/gabinete-store"

/**
 * Cadastro de pessoa feito pelo gabinete (sem pesquisa). Mesmo caminho do
 * formulário público: CEP → ViaCEP, endereço → Nominatim, e a pessoa entra no
 * mapa. Grava como `Resposta` com `pesquisaId` vazio.
 */
export function PessoaFormModal({
  open,
  onOpenChange,
  onCadastrada,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCadastrada?: (pessoa: Resposta) => void
}) {
  const gabinete = useGabineteStore((s) => s.gabinete)
  const registrarResposta = useGabineteStore((s) => s.registrarResposta)

  const [nome, setNome] = React.useState("")
  const [telefone, setTelefone] = React.useState("")
  const [cep, setCep] = React.useState("")
  const [rua, setRua] = React.useState("")
  const [numero, setNumero] = React.useState("")
  const [bairro, setBairro] = React.useState("")
  const [cidade, setCidade] = React.useState("")
  const [uf, setUf] = React.useState("")
  const [erros, setErros] = React.useState<Record<string, string>>({})
  const [buscandoCep, setBuscandoCep] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)

  const [abertoAntes, setAbertoAntes] = React.useState(false)
  if (open !== abertoAntes) {
    setAbertoAntes(open)
    if (open) {
      setNome("")
      setTelefone("")
      setCep("")
      setRua("")
      setNumero("")
      setBairro("")
      setCidade("")
      setUf("")
      setErros({})
    }
  }

  async function mudarCep(valor: string) {
    const formatado = formatZipCode(valor)
    setCep(formatado)
    if (formatado.replace(/\D/g, "").length !== 8) return
    setBuscandoCep(true)
    const e = await buscarCep(formatado)
    setBuscandoCep(false)
    if (!e) {
      setErros((x) => ({ ...x, cep: "CEP não encontrado — preencha o endereço abaixo" }))
      return
    }
    setErros((x) => ({ ...x, cep: "" }))
    setRua(e.rua)
    setBairro(e.bairro)
    setCidade(e.cidade)
    setUf(e.uf)
  }

  async function salvar(ev: React.FormEvent) {
    ev.preventDefault()
    const novos: Record<string, string> = {}
    if (!nome.trim()) novos.nome = "Informe o nome"
    const digitos = telefone.replace(/\D/g, "")
    if (digitos.length > 0 && digitos.length < 10) novos.telefone = "Telefone com DDD"
    if (!rua.trim() && !bairro.trim()) novos.rua = "Informe a rua ou pelo menos o bairro"
    setErros(novos)
    if (Object.values(novos).some(Boolean)) return

    setSalvando(true)
    const cidadeFinal = cidade.trim() || gabinete.cidade
    const ufFinal = uf.trim() || gabinete.uf
    const achado = await geocodificar({ rua, numero, bairro, cidade: cidadeFinal, uf: ufFinal })
    const [lng, lat] = gabinete.centro
    const ponto = achado ? (achado.aproximado ? espalhar(achado) : achado) : espalhar({ latitude: lat, longitude: lng })

    const pessoa = registrarResposta({
      pesquisaId: "",
      nome: nome.trim(),
      telefone,
      cep,
      rua: rua.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidadeFinal,
      uf: ufFinal,
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      aproximado: !achado || achado.aproximado,
      respostas: {},
    })
    setSalvando(false)
    toast.success("Pessoa cadastrada")
    onOpenChange(false)
    onCadastrada?.(pessoa)
  }

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title="Cadastrar pessoa" size="md">
      <form onSubmit={salvar} className="flex min-h-0 flex-1 flex-col">
        <FormModalHeader
          icon={UserPlus}
          title="Cadastrar pessoa"
          description="Entra na lista e no mapa, sem precisar responder pesquisa"
          onClose={() => onOpenChange(false)}
          disabled={salvando}
        />
        <div className={FORM_MODAL_BODY}>
          <Campo id="pessoa-nome" rotulo="Nome" erro={erros.nome}>
            <Input id="pessoa-nome" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo id="pessoa-telefone" rotulo="WhatsApp" erro={erros.telefone}>
              <Input
                id="pessoa-telefone"
                inputMode="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(51) 99999-9999"
              />
            </Campo>
            <Campo id="pessoa-cep" rotulo="CEP" erro={erros.cep}>
              <div className="relative">
                <Input
                  id="pessoa-cep"
                  inputMode="numeric"
                  value={cep}
                  onChange={(e) => mudarCep(e.target.value)}
                  placeholder="00000-000"
                />
                {buscandoCep && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </Campo>
          </div>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <Campo id="pessoa-rua" rotulo="Rua" erro={erros.rua}>
              <Input id="pessoa-rua" value={rua} onChange={(e) => setRua(e.target.value)} />
            </Campo>
            <Campo id="pessoa-numero" rotulo="Número">
              <Input id="pessoa-numero" inputMode="numeric" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </Campo>
          </div>
          <Campo id="pessoa-bairro" rotulo="Bairro">
            <Input id="pessoa-bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
          </Campo>
          <p className="text-xs text-muted-foreground">
            {cidade || gabinete.cidade}/{uf || gabinete.uf}
          </p>
        </div>
        <FormModalFooter
          onCancel={() => onOpenChange(false)}
          isLoading={salvando}
          submitLabel="Cadastrar"
          loadingLabel="Localizando..."
        />
      </form>
    </FormModal>
  )
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </div>
  )
}
