import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AuthUser } from "@/types/auth"
import { CONTA_DEMO } from "@/data/seed"

/**
 * SESSÃO DO MVP — sem API. Abre JÁ LOGADO na conta de demonstração
 * (`CONTA_DEMO`, pedido do Arthur): quem recebe o link vê o painel direto.
 * O Sair funciona e o login aceita só essa conta. Não é segurança.
 *
 * Mantém a forma do `auth-store` do template para a casca (barra, menu,
 * saudação) funcionar sem mudança.
 */

export const USUARIO_DEMO: AuthUser = {
  id: 1,
  name: CONTA_DEMO.nome,
  email: CONTA_DEMO.email,
  birthDate: null,
  avatarUrl: null,
  lastLoginAt: null,
  hidden: false,
  groupId: 1,
  group: { id: 1, name: "Gabinete" },
  createdAt: "2026-11-05T00:00:00.000Z",
  updatedAt: "2026-11-05T00:00:00.000Z",
}

interface AuthState {
  user: AuthUser | null
  permissions: string[]
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: AuthUser, permissions: string[], accessToken: string) => void
  updateProfile: (user: AuthUser, permissions: string[]) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: USUARIO_DEMO,
      permissions: ["*"],
      accessToken: "demo",
      isAuthenticated: true,
      isLoading: false,

      setAuth: (user, permissions, accessToken) =>
        set({ user, permissions, accessToken, isAuthenticated: true, isLoading: false }),

      updateProfile: (user, permissions) => set({ user, permissions }),

      logout: () =>
        set({ user: null, permissions: [], accessToken: null, isAuthenticated: false, isLoading: false }),

      setLoading: (loading) => set({ isLoading: loading }),

      /** MVP: uma conta só, com acesso a tudo. */
      hasPermission: () => true,
    }),
    {
      name: "meugabinete-sessao",
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
