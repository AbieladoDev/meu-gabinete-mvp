"use client"

import * as React from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { CheckCircle2, Landmark, Loader2, MapPin } from "lucide-react"

import { TagPicker } from "@/components/common/tag-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { buscarCep, espalhar, geocodificar } from "@/lib/endereco"
import { formatPhone, formatZipCode } from "@/lib/geo"
import { useGabineteStore, useHidratado } from "@/store/gabinete-store"

/**
 * FORMULÁRIO PÚBLICO — o link que o gabinete manda (WhatsApp). Fora da casca
 * e sem login. CEP → ViaCEP preenche rua/bairro/cidade; ao enviar, o endereço
 * vira coordenada (Nominatim) e a resposta aparece no mapa do painel.
 *
 * ⚠️ MVP só front: grava no localStorage DESTE navegador.
 */
export default function FormularioPublico() {
  const { id } = useParams<{ id: string }>()
  const hidratado = useHidratado()
  const pesquisa = useGabineteStore((s) => s.pesquisas.find((p) => p.id === id))
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
  const [respostas, setRespostas] = React.useState<Record<string, string>>({})
  const [erros, setErros] = React.useState<Record<string, string>>({})
  const [buscandoCep, setBuscandoCep] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)
  const [enviado, setEnviado] = React.useState(false)

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

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault()
    if (!pesquisa) return
    const novos: Record<string, string> = {}
    if (!nome.trim()) novos.nome = "Informe seu nome"
    if (telefone.replace(/\D/g, "").length < 10) novos.telefone = "Informe um telefone com DDD"
    if (cep.replace(/\D/g, "").length !== 8) novos.cep = "Informe o CEP"
    if (!rua.trim()) novos.rua = "Informe a rua"
    for (const q of pesquisa.perguntas) {
      if (q.obrigatoria && !respostas[q.id]?.trim()) novos[q.id] = "Responda esta pergunta"
    }
    setErros(novos)
    if (Object.values(novos).some(Boolean)) return

    setEnviando(true)
    const cidadeFinal = cidade.trim() || gabinete.cidade
    const ufFinal = uf.trim() || gabinete.uf
    const achado = await geocodificar({ rua, numero, bairro, cidade: cidadeFinal, uf: ufFinal })
    const [lng, lat] = gabinete.centro
    const ponto = achado
      ? achado.aproximado
        ? espalhar(achado)
        : achado
      : espalhar({ latitude: lat, longitude: lng })

    registrarResposta({
      pesquisaId: pesquisa.id,
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
      respostas,
    })
    setEnviando(false)
    setEnviado(true)
    window.scrollTo({ top: 0 })
  }

  const assinatura = `${gabinete.cargo} ${gabinete.vereador}${gabinete.partido ? ` · ${gabinete.partido}` : ""}`

  if (!hidratado) {
    return (
      <Centro>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Centro>
    )
  }

  if (!pesquisa || !pesquisa.ativa) {
    return (
      <Centro>
        <Landmark className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-lg font-semibold">{pesquisa ? "Esta pesquisa foi encerrada" : "Pesquisa não encontrada"}</p>
        <p className="text-sm text-muted-foreground">Obrigado pelo interesse! · {assinatura}</p>
      </Centro>
    )
  }

  if (enviado) {
    return (
      <Centro>
        <CheckCircle2 className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
        <p className="text-2xl font-semibold">Obrigado, {nome.trim().split(" ")[0]}!</p>
        <p className="max-w-sm text-muted-foreground">
          Sua resposta chegou ao gabinete do {assinatura}. Ela ajuda a decidir o que fazer primeiro no seu bairro.
        </p>
        <AssinaturaDb />
      </Centro>
    )
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
            <Landmark className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">{assinatura}</p>
            <p className="text-sm text-muted-foreground">
              {gabinete.cidade}/{gabinete.uf}
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{pesquisa.titulo}</h1>
        {pesquisa.descricao && <p className="mt-2 text-muted-foreground">{pesquisa.descricao}</p>}

        <form onSubmit={enviar} className="mt-8 space-y-8">
          <section className="space-y-4">
            <Campo id="nome" rotulo="Seu nome" erro={erros.nome}>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className="h-11 bg-background" />
            </Campo>
            <Campo id="telefone" rotulo="WhatsApp" erro={erros.telefone}>
              <Input
                id="telefone"
                inputMode="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(51) 99999-9999"
                className="h-11 bg-background"
              />
            </Campo>
          </section>

          <section className="space-y-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-blue-600" /> Onde você mora
            </p>
            <Campo id="cep" rotulo="CEP" erro={erros.cep}>
              <div className="relative">
                <Input
                  id="cep"
                  inputMode="numeric"
                  value={cep}
                  onChange={(e) => mudarCep(e.target.value)}
                  placeholder="00000-000"
                  className="h-11 bg-background"
                />
                {buscandoCep && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </Campo>
            <div className="grid grid-cols-[1fr_6rem] gap-3">
              <Campo id="rua" rotulo="Rua" erro={erros.rua}>
                <Input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} className="h-11 bg-background" />
              </Campo>
              <Campo id="numero" rotulo="Número">
                <Input id="numero" inputMode="numeric" value={numero} onChange={(e) => setNumero(e.target.value)} className="h-11 bg-background" />
              </Campo>
            </div>
            <Campo id="bairro" rotulo="Bairro">
              <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} className="h-11 bg-background" />
            </Campo>
            {cidade && (
              <p className="text-xs text-muted-foreground">
                {cidade}/{uf}
              </p>
            )}
          </section>

          {pesquisa.perguntas.map((q) => (
            <section key={q.id} className="space-y-3">
              <p className="font-medium">
                {q.texto}
                {!q.obrigatoria && <span className="ml-1 text-sm font-normal text-muted-foreground">(opcional)</span>}
              </p>
              {q.tipo === "escolha" ? (
                <TagPicker
                  label={q.texto}
                  value={respostas[q.id] ?? ""}
                  onChange={(v) => setRespostas((r) => ({ ...r, [q.id]: v }))}
                  options={q.opcoes.map((o) => ({ value: o, label: o }))}
                />
              ) : (
                <Textarea
                  rows={3}
                  value={respostas[q.id] ?? ""}
                  onChange={(e) => setRespostas((r) => ({ ...r, [q.id]: e.target.value }))}
                  className="bg-background"
                />
              )}
              {erros[q.id] && <p className="text-xs text-destructive">{erros[q.id]}</p>}
            </section>
          ))}

          <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Localizando seu endereço...
              </>
            ) : (
              "Enviar resposta"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Seus dados ficam só com o gabinete e não são divulgados.
          </p>
        </form>
        <AssinaturaDb />
      </div>
    </div>
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

/** "Desenvolvido por db.app" no rodapé do formulário público (pedido do Arthur). */
function AssinaturaDb() {
  return (
    <a
      href="https://www.instagram.com/db.app_/"
      target="_blank"
      rel="noreferrer"
      className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground opacity-80 hover:opacity-100"
    >
      desenvolvido por
      <Image src="/Logo-DB/db-app-azul.png" alt="db.app" width={1022} height={1621} className="h-7 w-auto dark:hidden" />
      <Image src="/Logo-DB/db-app-branco.png" alt="db.app" width={1022} height={1621} className="hidden h-7 w-auto dark:block" />
    </a>
  )
}

/** Mensagem de resultado: sem caixa, no centro da tela (regra da casa). */
function Centro({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">{children}</div>
  )
}
