/**
 * Tipos do MVP. Front-only: o "banco" é o `gabinete-store` (localStorage).
 * Os nomes foram pensados para virar models do `meugabinete-api` depois.
 */

export type TipoPergunta = "escolha" | "texto"

export interface Pergunta {
  id: string
  texto: string
  tipo: TipoPergunta
  /** Só para `escolha`. */
  opcoes: string[]
  obrigatoria: boolean
}

export interface Pesquisa {
  id: string
  titulo: string
  descricao: string
  perguntas: Pergunta[]
  /** Encerrada = o link mostra "pesquisa encerrada" e não aceita resposta. */
  ativa: boolean
  criadaEm: string
}

export interface Resposta {
  id: string
  pesquisaId: string
  nome: string
  telefone: string
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  uf: string
  latitude: number
  longitude: number
  /** true = não achou o endereço exato; o ponto foi para o bairro/cidade. */
  aproximado: boolean
  /** perguntaId → resposta */
  respostas: Record<string, string>
  criadaEm: string
}

export type SituacaoAtuacao = "andamento" | "concluida"

/** O que o gabinete fez (ou está fazendo) por UMA pessoa. Histórico da pessoa = as atuações dela. */
export interface Atuacao {
  id: string
  /** id da Resposta — a "pessoa" do MVP é quem respondeu uma pesquisa. */
  pessoaId: string
  categoria: string
  descricao: string
  situacao: SituacaoAtuacao
  /** dia (YYYY-MM-DD) */
  data: string
  criadaEm: string
}

export interface Gabinete {
  vereador: string
  cargo: string
  partido: string
  cidade: string
  uf: string
  /** [lng, lat] — centro do mapa e ponto de reserva quando o endereço não é achado. */
  centro: [number, number]
}

export interface Conta {
  nome: string
  email: string
  senha: string
}
