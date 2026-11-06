export interface Group {
  id: number
  name: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  birthDate: string | null
  avatarUrl: string | null
  /** Último login bem-sucedido; null para quem nunca entrou. */
  lastLoginAt: string | null
  hidden: boolean
  groupId: number | null
  group: Group | null
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  permissions: string[]
  accessToken: string
}

export interface AuthError {
  statusCode: number
  message: string
}
