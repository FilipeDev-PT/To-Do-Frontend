import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { BoardsPage } from '@/pages/BoardsPage'
import { server } from '@/test/server'
import { renderWithProviders, screen, userEvent, waitFor, within } from '@/test/test-utils'

describe('BoardsPage', () => {
  it('shows empty state when there are no boards', async () => {
    server.use(http.get('http://localhost:3334/boards', () => HttpResponse.json([])))
    renderWithProviders(<BoardsPage />)

    expect(await screen.findByText('Nenhum board ainda')).toBeInTheDocument()
  })

  it('lists boards from the API', async () => {
    renderWithProviders(<BoardsPage />)
    expect(await screen.findByRole('heading', { name: 'Board de teste' })).toBeInTheDocument()
  })

  it('creates a board', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BoardsPage />)

    await screen.findByRole('heading', { name: 'Board de teste' })
    await user.click(screen.getByRole('button', { name: '+ Novo board' }))
    await user.type(screen.getByLabelText('Título'), 'Board criado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    expect(await screen.findByRole('heading', { name: 'Board criado' })).toBeInTheDocument()
  })

  it('renames a board', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BoardsPage />)

    await screen.findByRole('heading', { name: 'Board de teste' })
    await user.click(screen.getByRole('button', { name: 'Renomear' }))
    const dialog = screen.getByRole('dialog')
    const titleInput = within(dialog).getByLabelText('Título')
    await user.clear(titleInput)
    await user.type(titleInput, 'Board renomeado')
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByRole('heading', { name: 'Board renomeado' })).toBeInTheDocument()
  })

  it('deletes a board after confirm', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderWithProviders(<BoardsPage />)

    await screen.findByRole('heading', { name: 'Board de teste' })
    await user.click(screen.getByRole('button', { name: 'Apagar' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Board de teste' })).not.toBeInTheDocument()
    })
    expect(await screen.findByText('Nenhum board ainda')).toBeInTheDocument()
  })

  it('shows API error and retries', async () => {
    const user = userEvent.setup()
    let attempts = 0
    server.use(
      http.get('http://localhost:3334/boards', () => {
        attempts += 1
        if (attempts === 1) {
          return HttpResponse.json(
            { error: 'InternalServerError', code: 'INTERNAL_ERROR', message: 'Falha temporária' },
            { status: 500 },
          )
        }
        return HttpResponse.json([])
      }),
    )

    renderWithProviders(<BoardsPage />)
    expect(await screen.findByText('Falha ao carregar')).toBeInTheDocument()
    expect(screen.getByText('Falha temporária')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByText('Nenhum board ainda')).toBeInTheDocument()
  })
})
