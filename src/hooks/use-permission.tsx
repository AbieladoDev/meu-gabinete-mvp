"use client"

import { useAuthStore } from "@/store/auth-store"

/** MVP: conta única com acesso total — mantido para a casca do template. */
export function usePermission(permission: string): boolean {
  return useAuthStore((s) => s.hasPermission)(permission)
}
