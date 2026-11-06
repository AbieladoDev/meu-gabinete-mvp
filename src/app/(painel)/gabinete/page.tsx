"use client"

import * as React from "react"
import { Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InfoHint } from "@/components/common/info-hint"
import { TagPicker } from "@/components/common/tag-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { geocodificar } from "@/lib/endereco"
import { useAuthStore } from "@/store/auth-store"
import { useGabineteStore, useHidratado } from "@/store/gabinete-store"

/** Dados do gabinete (aparecem no topo do formulário público) + restaurar a demo. */
export default function GabinetePage() {
  const hidratado = useHidratado()
  const gabinete = useGabineteStore((s) => s.gabinete)
  const salvarGabinete = useGabineteStore((s) => s.salvarGabinete)
  const restaurarDemo = useGabineteStore((s) => s.restaurarDemo)
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const permissions = useAuthStore((s) => s.permissions)

  const [dados, setDados] = React.useState(gabinete)
  const [salvando, setSalvando] = React.useState(false)
  const [carregado, setCarregado] = React.useState(false)
  if (hidratado && !carregado) {
    setCarregado(true)
    setDados(gabinete)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!dados.vereador.trim() || !dados.cidade.trim()) {
      toast.error("Preencha o nome e a cidade")
      return
    }
    setSalvando(true)
    let centro = dados.centro
    if (dados.cidade !== gabinete.cidade || dados.uf !== gabinete.uf) {
      const c = await geocodificar({ rua: "", numero: "", bairro: "", cidade: dados.cidade, uf: dados.uf })
      if (c) centro = [c.longitude, c.latitude]
      else toast.warning("Não achei a cidade no mapa; o centro continua o anterior")
    }
    const novo = { ...dados, vereador: dados.vereador.trim(), centro }
    salvarGabinete(novo)
    if (user) updateProfile({ ...user, name: novo.vereador }, permissions)
    setDados(novo)
    setSalvando(false)
    toast.success("Gabinete atualizado")
  }

  return (
    <DashboardLayout title="Meu gabinete" description="Estes dados aparecem no topo do formulário que a população recebe.">
      <form onSubmit={salvar} className="max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label>Cargo</Label>
          <TagPicker
            label="Cargo"
            value={dados.cargo}
            onChange={(cargo) => setDados({ ...dados, cargo })}
            options={["Vereador", "Vereadora", "Deputado", "Deputada", "Prefeito", "Prefeita"].map((v) => ({ value: v, label: v }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <div className="space-y-1.5">
            <Label htmlFor="vereador">Nome</Label>
            <Input id="vereador" value={dados.vereador} onChange={(e) => setDados({ ...dados, vereador: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="partido">Partido</Label>
            <Input id="partido" value={dados.partido} onChange={(e) => setDados({ ...dados, partido: e.target.value })} placeholder="Opcional" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
          <div className="space-y-1.5">
            <Label htmlFor="cidade" className="flex items-center gap-1.5">
              Cidade
              <InfoHint>O mapa abre centrado aqui, e quem não tiver o endereço achado cai no centro da cidade.</InfoHint>
            </Label>
            <Input id="cidade" value={dados.cidade} onChange={(e) => setDados({ ...dados, cidade: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="uf">UF</Label>
            <Input
              id="uf"
              maxLength={2}
              value={dados.uf}
              onChange={(e) => setDados({ ...dados, uf: e.target.value.toUpperCase() })}
            />
          </div>
        </div>
        <Button type="submit" disabled={salvando}>
          {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </form>

      <div className="mt-10 max-w-xl space-y-2 border-t pt-6">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          Dados de demonstração
          <InfoHint tone="warning">Apaga o que foi criado nesta demo e volta às pesquisas e respostas de exemplo.</InfoHint>
        </p>
        <Button
          variant="outline"
          onClick={() => {
            restaurarDemo()
            setCarregado(false)
            toast.success("Demonstração restaurada")
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar dados de demonstração
        </Button>
      </div>
    </DashboardLayout>
  )
}
