export type ApiErrorBody = {
  error?: string
  code?: string
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? 'Erro inesperado na API')
    this.name = 'ApiError'
    this.status = status
    this.code = body.code ?? 'UNKNOWN'
    this.details = body.details
  }
}
