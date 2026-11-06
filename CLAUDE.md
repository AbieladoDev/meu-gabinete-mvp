# meu-gabinete-mvp

**Cliente / nicho:** Meu Gabinete — sistema para vereador mandar **pesquisas** à população (link no
WhatsApp); quem responde informa CEP/rua e aparece no **mapa** do painel. MVP de demonstração do
mesmo produto do `meugabinete-admin`/`meugabinete-api`. **Não está em produção.**
**Papel:** painel + formulário público (front-only, sem API)
**Irmãos:** nenhum no MVP. O sistema "de verdade" já existe em `Worksplace/meugabinete-admin` +
`meugabinete-api` (apoiadores + mapa, sem pesquisas).

## Banco
Não usa banco. Dados em `src/store/gabinete-store.ts` (zustand + `persist`, chave `meugabinete-demo`),
semeados por `src/data/seed.ts`. Sessão em `src/store/auth-store.ts` (chave `meugabinete-sessao`).
Sem `.env` — não há variável.

## Comandos
dev: `pnpm dev` · build: `pnpm build` · test: `pnpm test` (Vitest, `src/lib`) · lint: `pnpm lint` ·
typecheck: `pnpm typecheck` · migration: não se aplica

## Estrutura
- `src/app/(painel)/` — dentro da casca: `/` Início, `/mapa`, `/pesquisas`, `/pesquisas/[id]` (ficha:
  link, resultados, mapa, comentários), `/pessoas` (tabela + `SidePanel`), `/gabinete` (nome, cargo,
  cidade + "Restaurar dados de demonstração"), `/atuacoes` (o que o gabinete fez por cada pessoa;
  aceita `?pessoa=<id>` e `?nova=1`).
- **Atuações = histórico da pessoa.** O dado mora no módulo (regra do template para módulo com
  pessoa); no `SidePanel` de `/pessoas` entra só o resumo (5 + "ver todas") e o "Registrar".
  Categorias em `CATEGORIAS_ATUACAO` (`data/seed.ts`), ícone/cor em `components/gabinete/atuacoes.tsx`.
  "Pessoa" no MVP = uma `Resposta`; quem responde duas pesquisas vira duas pessoas.
- `src/app/f/[id]` — **público**, o formulário que vai no link. Fora da casca, sem login.
- `src/app/login` — conta fixa `CONTA_DEMO` (`data/seed.ts`), já preenchida. Não é segurança.
- `src/data/tipos.ts` — Pesquisa, Pergunta, Resposta, Gabinete (nomes pensados para virar models).
- `src/lib/geo.ts` (+ `geo.test.ts`) — GeoJSON, contagens por bairro/opção, máscaras.
- `src/lib/endereco.ts` — ViaCEP + Nominatim **direto do navegador** (mesmos serviços do
  `meugabinete-api/src/address/`). Ordem: rua+nº → rua → bairro → cidade → centro do gabinete.
- `src/components/mapa/pontos-layer.tsx` — cluster + calor, portado de
  `meugabinete-admin/src/components/supporters/supporter-points-layer.tsx`.
- `src/components/gabinete/` — `pecas.tsx` (Pessoinha, barra de composição, Indicador, copiar
  link), `mapa-de-respostas.tsx`, `pesquisa-form-modal.tsx`.

## Diferenças em relação ao template
Base = `default-admin` de 05/11/2026 (casca padrão do todosDan-client, escala 80%), com:
- **Sem camada de API**: `lib/api`, axios, socket, presença (`online-team`), Gerencial, Usuários,
  Grupos, Histórico e Meu perfil saíram. O `gabinete-store` faz o papel da API.
- **Abre já logado** (pedido do Arthur): `auth-store` nasce autenticado com `USUARIO_DEMO`;
  `hasPermission` sempre `true`. `AuthGuard` espera a hidratação e só manda para `/login` quem
  clicou em Sair. "Meu perfil" virou "Meu gabinete" (`/gabinete`).
- `search-input.tsx` copiado do `degasBeer-admin` (busca recolhida — o template ainda tem a aberta).
- Sem deploy de container (`.github`, `Dockerfile`, compose e `scripts/novo-modulo` removidos):
  MVP vai para a Vercel, como os outros.

## Armadilhas
1. **Só front: o link mandado a uma pessoa de verdade NÃO traz a resposta para o painel.** A resposta
   grava no navegador de quem respondeu. Para demonstrar, responder no mesmo navegador do painel.
2. Painel só renderiza depois de montar no navegador (dados do localStorage, datas do seed relativas
   a hoje): `curl` numa rota devolve 200 com spinner — não prova que a tela funciona.
3. Mudou um tipo em `data/tipos.ts`? Quem já abriu a demo tem o formato velho: "Restaurar dados de
   demonstração" em `/gabinete` ou subir `version` no `persist`.
4. Nominatim público = ~1 pedido/s, sem garantia. Fora do ar ou endereço não achado → ponto
   `aproximado` (bairro/cidade, espalhado ~150 m). No sistema real, geocodificar na API com cache.
5. Posições dos bairros do seed são **aproximadas** e ruas/pessoas inventadas.
6. **Prévia do link (WhatsApp/Instagram)** = `src/app/opengraph-image.png` (+ `twitter-image.png`), gerada
   com sharp a partir de `meugabinete-admin/public/Logo-DB/Logotipo - DB APP Developer FUNDO AZUL.png`.
   Na Vercel o Next completa a URL sozinho; fora dela, setar `metadataBase` no `layout.tsx` (o build
   local avisa "using http://localhost:3000" — normal). Formulário público assina "desenvolvido por db.app".
7. Atalhos `?nova=1`, `?pesquisa=`, `?id=` são lidos com `window.location.search` num efeito
   (`useSearchParams` exigiria Suspense no build).
