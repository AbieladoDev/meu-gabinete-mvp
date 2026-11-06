/**
 * "Volta para onde estava" depois de a sessão cair (03/11/2026): o `axios`
 * guarda a rota no 401 e a camada de boas-vindas usa ao entrar de novo.
 * `sessionStorage` = só nesta aba; some ao fechar.
 */
const CHAVE = "voltar-para"

/** Só caminho interno do painel — nunca URL de fora nem as telas de entrada. */
export function rotaValida(rota: string | null | undefined): string | null {
  if (!rota || !rota.startsWith("/") || rota.startsWith("//") || rota.startsWith("/\\")) return null
  if (rota.startsWith("/login") || rota.startsWith("/session-expired")) return null
  return rota
}

export function guardarVoltarPara(rota: string): void {
  try {
    const valida = rotaValida(rota)
    if (valida) sessionStorage.setItem(CHAVE, valida)
  } catch {
    /* navegador sem storage: só não volta */
  }
}

/** Lê e apaga (vale uma vez). */
export function consumirVoltarPara(): string | null {
  try {
    const rota = rotaValida(sessionStorage.getItem(CHAVE))
    sessionStorage.removeItem(CHAVE)
    return rota
  } catch {
    return null
  }
}
