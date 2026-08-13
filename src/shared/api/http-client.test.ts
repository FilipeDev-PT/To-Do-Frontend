import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api/api-error'
import { httpClient } from '@/shared/api/http-client'

describe('httpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns JSON on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(httpClient<{ ok: boolean }>('/healthz')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3334/healthz',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          'x-request-id': expect.any(String),
        }),
      }),
    )
  })

  it('returns undefined on 204', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    )
    await expect(httpClient<void>('/boards/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('sends JSON body and content-type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: '1' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await httpClient('/boards', { method: 'POST', body: { title: 'Novo' } })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3334/boards',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Novo' }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    )
  })

  it('throws ApiError on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: 'NotFoundError',
            code: 'NOT_FOUND',
            message: 'Board não encontrado',
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    await expect(httpClient('/boards/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'NOT_FOUND',
      message: 'Board não encontrado',
    } satisfies Partial<ApiError>)
  })

  it('throws ApiError when error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('boom', { status: 500, statusText: 'Server Error' })),
    )

    await expect(httpClient('/boom')).rejects.toMatchObject({
      status: 500,
      message: 'Server Error',
    })
  })
})
