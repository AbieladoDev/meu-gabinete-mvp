import { AxiosError } from "axios"
import { toast } from "sonner"

// Tipo padrão de resposta de erro da API
export interface ApiErrorResponse {
  message: string
  error: string
  statusCode: number
}

/**
 * Extrai a mensagem de erro de uma resposta da API
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined

    // Freio de tentativas do login (ThrottlerGuard): a mensagem da biblioteca é em inglês.
    if (error.response?.status === 429) {
      return "Muitas tentativas. Aguarde alguns minutos e tente de novo."
    }

    // Se a API retornou uma mensagem, usa ela
    if (data?.message) {
      return data.message
    }

    // Fallbacks baseados no status
    switch (error.response?.status) {
      case 400:
        return "Dados inválidos"
      case 401:
        return "Não autorizado"
      case 403:
        return "Acesso negado"
      case 404:
        return "Recurso não encontrado"
      case 422:
        return "Dados de entrada inválidos"
      case 500:
        return "Erro interno do servidor"
      case 502:
        return "Servidor indisponível"
      case 503:
        return "Serviço temporariamente indisponível"
    }

    // Erros de rede
    if (error.code === "ERR_NETWORK") {
      return "Erro de conexão com o servidor"
    }

    if (error.code === "ECONNABORTED") {
      return "Tempo de conexão esgotado"
    }
  }

  // Erro genérico
  if (error instanceof Error) {
    return error.message
  }

  return "Ocorreu um erro inesperado"
}

/**
 * Mostra um toast de erro com a mensagem da API
 */
export function showApiError(error: unknown, fallbackMessage?: string): void {
  const message = fallbackMessage || getApiErrorMessage(error)
  toast.error(message)
}

/**
 * Handler genérico para erros de API em try/catch
 * Retorna a mensagem de erro e opcionalmente mostra o toast
 */
export function handleApiError(
  error: unknown,
  options?: {
    showToast?: boolean
    fallbackMessage?: string
  }
): string {
  const message = options?.fallbackMessage || getApiErrorMessage(error)

  if (options?.showToast !== false) {
    toast.error(message)
  }

  return message
}
