/**
 * O CABEÇALHO DO MÓDULO (30/10/2026, pedido do Arthur — o mesmo do
 * `todosDan-client`): o cabeçalho de cima mora dentro da janela, com a TRILHA à
 * esquerda, a busca no centro e o + à direita. A trilha sai do cabeçalho da
 * tela (`DashboardLayout`), que só a publica (`store/trilha-store.ts`).
 *
 * No admin vale para TODA tela do painel (rotas na raiz, grupo `(painel)`) —
 * inclusive o Início, que é `bare` e só publica o próprio nome. Ficou função,
 * como no client, para a tela que um dia tiver cabeçalho próprio sair daqui.
 */
export function usaCabecalhoDoModulo(pathname: string): boolean {
  return pathname.startsWith("/")
}
