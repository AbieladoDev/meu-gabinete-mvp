import { PainelShell } from "@/components/layout/painel-shell"

/**
 * Layout do painel: a casca (barra, cabeçalho do módulo, janela) monta UMA vez
 * e fica entre as telas — só o conteúdo troca. As pastas dentro de `(painel)`
 * não mudam a url (grupo de rotas do Next). Tela nova logada mora aqui dentro.
 *
 * ⚠️ Componente de servidor; a casca é que é `"use client"`.
 */
export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <PainelShell>{children}</PainelShell>
}
