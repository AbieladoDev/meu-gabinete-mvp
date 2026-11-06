"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"

/**
 * MVP: espera o persist ler o localStorage e manda para /login só quem clicou
 * em Sair. Primeiro acesso (storage vazio) = sessão demo já logada.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hidratado = useSyncExternalStore(
    (avisar) => useAuthStore.persist.onFinishHydration(avisar),
    () => useAuthStore.persist.hasHydrated(),
    () => false
  )

  useEffect(() => {
    if (hidratado && !isAuthenticated) router.replace("/login")
  }, [hidratado, isAuthenticated, router])

  if (!hidratado || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
