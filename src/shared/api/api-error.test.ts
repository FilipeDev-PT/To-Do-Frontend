import { describe, expect, it } from 'vitest'
import { ApiError } from '@/shared/api/api-error'

describe('ApiError', () => {
  it('maps body fields', () => {
    const error = new ApiError(404, {
      code: 'NOT_FOUND',
      message: 'Board não encontrado',
      details: [{ path: 'id' }],
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ApiError')
    expect(error.status).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe('Board não encontrado')
    expect(error.details).toEqual([{ path: 'id' }])
  })

  it('uses defaults when body is empty', () => {
    const error = new ApiError(500, {})
    expect(error.code).toBe('UNKNOWN')
    expect(error.message).toBe('Erro inesperado na API')
  })
})
