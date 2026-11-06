# DECISIONS — meu-gabinete-mvp

Mais recente no topo. As decisões do `default-admin` (base deste projeto) estão no DECISIONS.md de lá.

## 2026-11-05 — MVP só front, base no default-admin, já logado
**Decidido:** front-only como `apae-mvp`/`dr-financeiro-mvp` (zustand + `localStorage`), copiado do
`default-admin` atual (casca padrão desde 31/10/2026) sem a camada de API, abrindo já logado numa
conta de demonstração. CEP → ViaCEP e endereço → Nominatim chamados do navegador.
**Por quê:** pedido do Arthur ("como é MVP, já sabe as regras"; "já logado com uma conta") — é
para mostrar o fluxo pesquisa → mapa ao cliente.
**Rejeitado:** (a) estender o `meugabinete-admin`/`-api` — é o sistema real, e o pedido foi um
MVP neste repo; (b) copiar do `apae-mvp` — a casca dele é anterior à regra de 31/10/2026;
(c) Next + Prisma no Postgres da casa — faria o link funcionar entre aparelhos, mas não é o
padrão de MVP.
**Consequência aceita:** o link só traz resposta para o painel se for respondido no mesmo
navegador. Para mandar à população de verdade, precisa de backend.
