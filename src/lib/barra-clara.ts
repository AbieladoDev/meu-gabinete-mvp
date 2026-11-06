/**
 * O modo da NAVEGAÇÃO — barra lateral e cabeçalho (30/08/2026).
 *
 * São dois, e com o tema (claro/escuro) eles dão as quatro combinações do
 * painel:
 *
 * - **contraste** (padrão): a navegação é o CONTRÁRIO do conteúdo — barra
 *   quase preta no tema claro, cinza um degrau acima no escuro. É a decisão
 *   de 27/08/2026.
 * - **uniforme**: a navegação ACOMPANHA o conteúdo — tudo branco no claro,
 *   tudo escuro no escuro.
 *
 * É preferência **do dispositivo**, como o interruptor sol/lua e o estado
 * recolhido da barra: não vai para a API e não é padrão do sistema. Duas
 * pessoas no mesmo sistema podem ver o painel diferente, e isso é esperado.
 *
 * ⚠️ O valor mora num ATRIBUTO no `<html>` (`data-barra="uniforme"`), lido
 * pelo CSS em `globals.css`. Nada em React lê este estado para desenhar cor —
 * quem troca de cor são os tokens `--sidebar-*`.
 */

export type ModoDaBarra = "contraste" | "uniforme"

/**
 * O PADRÃO do produto (30/08/2026, decisão do Arthur): claro com a navegação
 * UNIFORME. Quem nunca abriu o menu de aparência vê isto.
 */
export const MODO_PADRAO: ModoDaBarra = "uniforme"

export const CHAVE_BARRA_CLARA = "painel-barra-clara"

/** O que roda ANTES da primeira pintura — ver `SCRIPT_BARRA_CLARA`. */
export function aplicarBarraClara(modo: ModoDaBarra) {
  const html = document.documentElement
  if (modo === "uniforme") html.setAttribute("data-barra", "uniforme")
  else html.removeAttribute("data-barra")
}

export function lerBarraClara(): ModoDaBarra {
  try {
    /* ⚠️ `"1"` é o valor da primeira versão desta chave, quando ela era um
       booleano ("barra clara" ligada/desligada). Ler os dois evita que quem
       já tinha escolhido volte ao padrão sem ter pedido. */
    const bruto = localStorage.getItem(CHAVE_BARRA_CLARA)
    /* ⚠️ Quem NUNCA escolheu cai no PADRÃO, que é `uniforme` — só o valor
       gravado "contraste" desliga. Ver `MODO_PADRAO`. */
    return bruto === "contraste" ? "contraste" : "uniforme"
  } catch {
    /* Navegador com storage bloqueado: o painel abre no padrão, sem quebrar. */
    return MODO_PADRAO
  }
}

export function gravarBarraClara(modo: ModoDaBarra) {
  try {
    localStorage.setItem(CHAVE_BARRA_CLARA, modo)
  } catch {
    /* Idem: a escolha vale nesta sessão e não persiste. */
  }
}

/**
 * O script inline do `<head>`, no mesmo espírito do que o next-themes injeta.
 *
 * ⚠️ **Tem que rodar antes da primeira pintura.** Aplicando por `useEffect`, o
 * painel aparece com a barra do modo padrão e ela troca um quadro depois — o
 * flash que o próprio next-themes existe para evitar. Por isso é uma string
 * num `dangerouslySetInnerHTML`, e não um componente.
 *
 * ⚠️ `try/catch` obrigatório: em janela anônima ou com cookies de site
 * bloqueados, `localStorage` **lança** ao ser acessado — sem ele, o script
 * quebraria antes de o app montar.
 */
export const SCRIPT_BARRA_CLARA = `try{if(localStorage.getItem('${CHAVE_BARRA_CLARA}')!=='contraste'){document.documentElement.setAttribute('data-barra','uniforme')}}catch(e){document.documentElement.setAttribute('data-barra','uniforme')}`
