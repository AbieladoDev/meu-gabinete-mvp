/**
 * Helpers de verificação de permissão (RBAC).
 *
 * O backend retorna `['*']` para grupos de sistema (Super Admin), que
 * significa "acesso total". Todas as checagens abaixo tratam esse coringa.
 */

export const WILDCARD_PERMISSION = "*"

/** Usuário tem `permission`? (respeita o coringa '*') */
export function can(userPermissions: string[], permission: string): boolean {
  return (
    userPermissions.includes(WILDCARD_PERMISSION) ||
    userPermissions.includes(permission)
  )
}

/** Usuário tem ALGUMA das `permissions`? Array vazio/indefinido = sempre true. */
export function canAny(
  userPermissions: string[],
  permissions?: string[]
): boolean {
  if (!permissions || permissions.length === 0) return true
  if (userPermissions.includes(WILDCARD_PERMISSION)) return true
  return permissions.some((p) => userPermissions.includes(p))
}

/** Usuário tem TODAS as `permissions`? */
export function canAll(
  userPermissions: string[],
  permissions: string[]
): boolean {
  if (userPermissions.includes(WILDCARD_PERMISSION)) return true
  return permissions.every((p) => userPermissions.includes(p))
}
