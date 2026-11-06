import type { Atuacao, Conta, Gabinete, Pesquisa, Resposta } from "./tipos"

/**
 * Dados de demonstração. Cidade de exemplo: Sapucaia do Sul/RS.
 * ⚠️ As posições dos bairros são APROXIMADAS (servem para a demo ter forma de
 * cidade no mapa) e ruas/pessoas são inventadas. Datas são relativas a hoje.
 */

export const CONTA_DEMO: Conta = {
  nome: "Carlos Mendes",
  email: "vereador@meugabinete.app",
  senha: "gabinete123",
}

export const GABINETE_DEMO: Gabinete = {
  vereador: "Carlos Mendes",
  cargo: "Vereador",
  partido: "",
  cidade: "Sapucaia do Sul",
  uf: "RS",
  centro: [-51.1609, -29.8197], // centro da cidade no OpenStreetMap
}

export const PESQUISAS_DEMO: Pesquisa[] = [
  {
    id: "prioridades",
    titulo: "Prioridades do seu bairro",
    descricao:
      "Queremos saber o que mais precisa de atenção perto da sua casa. Leva menos de um minuto.",
    ativa: true,
    criadaEm: diasAtras(40),
    perguntas: [
      {
        id: "necessidade",
        texto: "Qual a maior necessidade do seu bairro hoje?",
        tipo: "escolha",
        opcoes: ["Saúde", "Segurança", "Iluminação", "Asfalto e calçadas", "Educação", "Transporte"],
        obrigatoria: true,
      },
      {
        id: "avaliacao",
        texto: "Como você avalia o seu bairro?",
        tipo: "escolha",
        opcoes: ["Ótimo", "Bom", "Regular", "Ruim"],
        obrigatoria: true,
      },
      {
        id: "sugestao",
        texto: "Quer deixar uma sugestão?",
        tipo: "texto",
        opcoes: [],
        obrigatoria: false,
      },
    ],
  },
  {
    id: "iluminacao",
    titulo: "Iluminação pública",
    descricao: "Mapeamento das ruas com pouca ou nenhuma iluminação à noite.",
    ativa: true,
    criadaEm: diasAtras(15),
    perguntas: [
      {
        id: "situacao",
        texto: "A iluminação da sua rua é adequada?",
        tipo: "escolha",
        opcoes: ["Sim", "Parcialmente", "Não"],
        obrigatoria: true,
      },
      {
        id: "ponto",
        texto: "Algum ponto específico sem luz? (ex.: perto da escola)",
        tipo: "texto",
        opcoes: [],
        obrigatoria: false,
      },
    ],
  },
  {
    id: "saude",
    titulo: "Atendimento no posto de saúde",
    descricao: "Pesquisa encerrada em setembro.",
    ativa: false,
    criadaEm: diasAtras(75),
    perguntas: [
      {
        id: "espera",
        texto: "Quanto tempo você esperou na última consulta?",
        tipo: "escolha",
        opcoes: ["Até 1 hora", "1 a 3 horas", "Mais de 3 horas", "Não consegui atendimento"],
        obrigatoria: true,
      },
    ],
  },
]

/** [nome, lng, lat] — centro aproximado de cada bairro (deslocado para o centro real em `BAIRROS`). */
const BAIRROS_BASE: [string, number, number][] = [
  ["Centro", -51.1452, -29.8276],
  ["Vargas", -51.1385, -29.8205],
  ["Capão da Cruz", -51.1555, -29.8375],
  ["Primor", -51.1325, -29.8335],
  ["Paraíso", -51.1600, -29.8185],
  ["Lomba da Palmeira", -51.1250, -29.8150],
  ["Fortuna", -51.1505, -29.8450],
  ["Jardim", -51.1405, -29.8395],
  ["Piratini", -51.1660, -29.8300],
  ["Walderez", -51.1300, -29.8250],
  ["Camboim", -51.1200, -29.8380],
  ["Nova Sapucaia", -51.1540, -29.8120],
]

// A grade acima foi desenhada em volta de (-51.1452, -29.8276); o centro do OSM é (-51.1609, -29.8197).
const BAIRROS: [string, number, number][] = BAIRROS_BASE.map(([n, lng, lat]) => [n, lng - 0.0157, lat + 0.0079])

const RUAS = [
  "Rua das Acácias", "Rua Tiradentes", "Av. Brasil", "Rua São Paulo", "Rua XV de Novembro",
  "Rua Bento Gonçalves", "Rua dos Ipês", "Rua Santa Catarina", "Rua Paraná", "Rua Getúlio Vargas",
  "Rua das Hortênsias", "Rua Duque de Caxias", "Rua Osvaldo Aranha", "Rua Marechal Deodoro",
]

const NOMES = [
  "Ana", "Bruno", "Carla", "Diego", "Eduarda", "Fernando", "Gabriela", "Henrique", "Isabela",
  "João", "Larissa", "Marcos", "Natália", "Otávio", "Patrícia", "Rafael", "Sabrina", "Tiago",
  "Vanessa", "William", "Luana", "Maurício", "Simone", "Paulo", "Rosane", "Cláudio", "Juliana",
]

const SOBRENOMES = [
  "Silva", "Souza", "Oliveira", "Pereira", "Costa", "Rodrigues", "Almeida", "Nunes", "Lima",
  "Ferreira", "Machado", "Rocha", "Schmidt", "Becker", "Ribeiro", "Martins", "Carvalho", "Moraes",
]

const SUGESTOES = [
  "Mais policiamento à noite perto da praça.",
  "Arrumar os buracos da rua, está difícil passar de carro.",
  "Precisamos de uma creche mais perto.",
  "O ônibus demora muito no fim de semana.",
  "Poste queimado na esquina há meses.",
  "Faltam médicos no posto.",
  "",
  "",
  "",
]

/** Pesos por bairro: a necessidade varia de lugar para lugar (a demo fica com "cara" de dado real). */
const NECESSIDADE_POR_BAIRRO: Record<string, string[]> = {
  Centro: ["Segurança", "Transporte", "Segurança", "Saúde"],
  Vargas: ["Asfalto e calçadas", "Iluminação", "Asfalto e calçadas"],
  "Capão da Cruz": ["Saúde", "Segurança", "Saúde", "Educação"],
  Primor: ["Iluminação", "Asfalto e calçadas", "Segurança"],
  Paraíso: ["Educação", "Saúde", "Transporte"],
  "Lomba da Palmeira": ["Asfalto e calçadas", "Transporte", "Iluminação", "Asfalto e calçadas"],
  Fortuna: ["Saúde", "Saúde", "Segurança"],
  Jardim: ["Segurança", "Iluminação"],
  Piratini: ["Transporte", "Educação", "Asfalto e calçadas"],
  Walderez: ["Iluminação", "Segurança", "Iluminação"],
  Camboim: ["Asfalto e calçadas", "Saúde", "Transporte"],
  "Nova Sapucaia": ["Educação", "Segurança", "Saúde"],
}

/** Gerador determinístico — a demo é igual em todo navegador. */
function rng(semente: number) {
  let s = semente
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function diasAtras(dias: number, aleatorio = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  d.setHours(8 + Math.floor(aleatorio * 12), Math.floor(aleatorio * 59), 0, 0)
  return d.toISOString()
}

function gerarRespostas(): Resposta[] {
  const r = rng(42)
  const pick = <T,>(lista: T[]) => lista[Math.floor(r() * lista.length)]
  const lista: Resposta[] = []

  const porPesquisa: [string, number, number][] = [
    // id, quantidade, janela em dias
    ["prioridades", 86, 40],
    ["iluminacao", 38, 15],
    ["saude", 24, 75],
  ]

  let n = 0
  for (const [pesquisaId, quantidade, janela] of porPesquisa) {
    for (let i = 0; i < quantidade; i++) {
      n++
      const [bairro, lng, lat] = pick(BAIRROS)
      const nome = `${pick(NOMES)} ${pick(SOBRENOMES)}`
      const respostas: Record<string, string> = {}
      if (pesquisaId === "prioridades") {
        respostas.necessidade = r() < 0.7 ? pick(NECESSIDADE_POR_BAIRRO[bairro]) : pick(PESQUISAS_DEMO[0].perguntas[0].opcoes)
        respostas.avaliacao = pick(["Ótimo", "Bom", "Bom", "Regular", "Regular", "Ruim"])
        respostas.sugestao = pick(SUGESTOES)
      } else if (pesquisaId === "iluminacao") {
        respostas.situacao = ["Primor", "Walderez", "Vargas"].includes(bairro)
          ? pick(["Não", "Não", "Parcialmente"])
          : pick(["Sim", "Sim", "Parcialmente", "Não"])
        respostas.ponto = r() < 0.3 ? "Perto da escola, na esquina" : ""
      } else {
        respostas.espera = pick(["Até 1 hora", "1 a 3 horas", "1 a 3 horas", "Mais de 3 horas", "Não consegui atendimento"])
      }
      const dias = Math.floor(Math.pow(r(), 1.6) * janela)
      lista.push({
        id: `seed-${n}`,
        pesquisaId,
        nome,
        telefone: `(51) 9${Math.floor(8000 + r() * 1999)}-${String(Math.floor(r() * 9999)).padStart(4, "0")}`,
        cep: `932${String(Math.floor(r() * 30)).padStart(2, "0")}-${String(Math.floor(r() * 999)).padStart(3, "0")}`,
        rua: pick(RUAS),
        numero: String(Math.floor(10 + r() * 1800)),
        bairro,
        cidade: "Sapucaia do Sul",
        uf: "RS",
        // espalha ~400 m em volta do centro do bairro
        longitude: lng + (r() - 0.5) * 0.009,
        latitude: lat + (r() - 0.5) * 0.008,
        aproximado: false,
        respostas,
        criadaEm: diasAtras(dias, r()),
      })
    }
  }
  return lista.sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
}

export function respostasDemo(): Resposta[] {
  return gerarRespostas()
}

export const CATEGORIAS_ATUACAO = [
  "Saúde",
  "Obra / buraco",
  "Iluminação",
  "Documentação",
  "Vaga em creche/escola",
  "Assistência social",
  "Outro",
]

const ATUACOES_EXEMPLO: [string, string, number, boolean][] = [
  // categoria, descrição, dias atrás, concluída
  ["Saúde", "Encaminhado pedido de consulta com ortopedista à Secretaria de Saúde.", 3, false],
  ["Obra / buraco", "Pedido de operação tapa-buraco protocolado na prefeitura.", 6, true],
  ["Iluminação", "Indicação de troca de lâmpada do poste da esquina aprovada na Câmara.", 9, true],
  ["Documentação", "Ajuda para agendar a 2ª via da identidade.", 2, false],
  ["Vaga em creche/escola", "Contato com a SMED sobre vaga na EMEI do bairro.", 12, false],
  ["Assistência social", "Encaminhamento ao CRAS para cadastro no CadÚnico.", 18, true],
  ["Saúde", "Retorno: consulta marcada para o dia 20.", 1, true],
  ["Obra / buraco", "Vistoria da calçada pedida à Secretaria de Obras.", 22, false],
  ["Iluminação", "Pedido de iluminação na praça encaminhado.", 15, false],
  ["Outro", "Reunião com moradores sobre o transporte no fim de semana.", 27, true],
]

/** Atuações de exemplo nas pessoas mais recentes do seed (algumas com mais de uma). */
export function atuacoesDemo(respostas: Resposta[]): Atuacao[] {
  const lista: Atuacao[] = []
  ATUACOES_EXEMPLO.forEach(([categoria, descricao, dias, concluida], i) => {
    const pessoa = respostas[i % 7]
    if (!pessoa) return
    const d = new Date()
    d.setDate(d.getDate() - dias)
    lista.push({
      id: "seed-a" + (i + 1),
      pessoaId: pessoa.id,
      categoria,
      descricao,
      situacao: concluida ? "concluida" : "andamento",
      data: d.toISOString().slice(0, 10),
      criadaEm: d.toISOString(),
    })
  })
  return lista.sort((a, b) => b.data.localeCompare(a.data))
}
