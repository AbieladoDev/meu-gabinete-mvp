"use client"

import { useRouter } from "next/navigation"

import { GreetingOverlay } from "@/components/auth/greeting-overlay"
import { mediaUrl } from "@/lib/media-url"
import { useAuthStore } from "@/store/auth-store"
import { useGreetingStore } from "@/store/greeting-store"
import { consumirVoltarPara } from "@/lib/voltar-para"

/**
 * A camada de boas-vindas/tchau, montada UMA vez no layout raiz
 * (`app/layout.tsx`) — ver o porquê em `greeting-store.ts`.
 *
 * - **Entrada:** navega para `/` quando o fundo termina de cobrir; o painel
 *   monta POR BAIXO enquanto a animação toca. ⚠️ O login NÃO navega sozinho
 *   enquanto há saudação (o efeito "autenticado → /" dele espera).
 * - **Saída:** o painel fica por baixo até o conteúdo da animação sair; aí o
 *   logout e a navegação para `/login`. ⚠️ Logout ANTES de navegar: o login
 *   manda de volta para `/` quem ainda está autenticado.
 */
export function GreetingLayer() {
  const router = useRouter()
  const current = useGreetingStore((s) => s.current)
  const finish = useGreetingStore((s) => s.finish)
  const logout = useAuthStore((s) => s.logout)

  if (!current) return null

  return (
    <GreetingOverlay
      /* a chave garante uma animação nova a cada saudação */
      key={`${current.kind}-${current.name}`}
      name={current.name}
      avatarUrl={mediaUrl(current.avatarUrl)}
      goodbye={current.kind === "goodbye"}
      onCovered={
        current.kind === "welcome" ? () => router.replace(consumirVoltarPara() ?? "/") : undefined
      }
      onContentGone={
        current.kind === "goodbye"
          ? () => {
              logout()
              router.replace("/login")
            }
          : undefined
      }
      onDone={finish}
    />
  )
}
