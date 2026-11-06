/**
 * Converte a chave de um arquivo (`users/uuid.png`) na URL pública. Portado
 * do degasBeer-admin/db-admin.
 *
 * É o ÚNICO ponto do painel que sabe fazer essa conversão. O banco guarda só a
 * chave: gravar a URL quebraria todas as imagens no dia em que o domínio do
 * bucket mudasse. Trocar de CDN aqui é editar uma variável de ambiente.
 * ⚠️ Toda imagem vinda da API passa por aqui — nunca a chave direto no `src`.
 *
 * Sem `NEXT_PUBLIC_MEDIA_BASE_URL` devolve `null` — a imagem existe, só não há
 * endereço público para exibi-la (as bolinhas caem nas iniciais).
 */
const PUBLIC_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "")

export function mediaUrl(value: unknown, base: string | undefined = PUBLIC_BASE): string | null {
  if (typeof value !== "string") return null
  const key = value.trim()
  if (!key) return null
  return base ? `${base}/${key}` : null
}
