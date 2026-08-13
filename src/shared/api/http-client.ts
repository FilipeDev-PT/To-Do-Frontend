import { env } from '@/shared/config/env'
import { ApiError, type ApiErrorBody } from '@/shared/api/api-error'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

function createRequestId() {
  return crypto.randomUUID()
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {}
  try {
    body = (await response.json()) as ApiErrorBody
  } catch {
    body = { message: response.statusText || 'Erro na requisição' }
  }
  return new ApiError(response.status, body)
}

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      'x-request-id': createRequestId(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw await parseError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
