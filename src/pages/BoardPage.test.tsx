import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { BoardPage } from '@/pages/BoardPage'
import { BOARD_ID } from '@/test/fixtures'
import { server } from '@/test/server'
import { renderWithProviders, screen, userEvent, waitFor, within } from '@/test/test-utils'

function renderBoardPage(boardId: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/boards/:boardId" element={<BoardPage />} />
    </Routes>,
    { route: `/boards/${boardId}` },
  )
}

describe('BoardPage', () => {
  it('loads board title and columns', async () => {
    renderBoardPage(BOARD_ID)

    expect(await screen.findByRole('button', { name: 'Board de teste' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A Fazer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Feito' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Card A/ })).toBeInTheDocument()
  })

  it('shows error state for missing board', async () => {
    renderBoardPage('99999999-9999-4999-8999-999999999999')

    expect(await screen.findByText('Board indisponível')).toBeInTheDocument()
    expect(screen.getByText('Board não encontrado')).toBeInTheDocument()
  })

  it('creates a column and a card', async () => {
    const user = userEvent.setup()
    renderBoardPage(BOARD_ID)

    await screen.findByRole('button', { name: 'Board de teste' })

    await user.type(screen.getByPlaceholderText('Ex.: Em progresso'), 'Revisão')
    await user.click(screen.getByRole('button', { name: 'Adicionar coluna' }))
    expect(await screen.findByRole('button', { name: 'Revisão' })).toBeInTheDocument()

    const doneColumn = screen.getByRole('button', { name: 'Feito' }).closest('section')
    expect(doneColumn).toBeTruthy()
    await user.click(within(doneColumn as HTMLElement).getByRole('button', { name: '+ Novo card' }))
    await user.type(screen.getByPlaceholderText('Título do card'), 'Card novo')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(await screen.findByRole('button', { name: /Card novo/ })).toBeInTheDocument()
  })

  it('edits a card in the modal', async () => {
    const user = userEvent.setup()
    renderBoardPage(BOARD_ID)

    await user.click(await screen.findByRole('button', { name: /Card A/ }))
    const dialog = await screen.findByRole('dialog')
    const titleInput = within(dialog).getByLabelText('Título')
    await user.clear(titleInput)
    await user.type(titleInput, 'Card atualizado')
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByRole('button', { name: /Card atualizado/ })).toBeInTheDocument()
  })

  it('deletes a card from the modal', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderBoardPage(BOARD_ID)

    await user.click(await screen.findByRole('button', { name: /Card A/ }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Apagar' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Card A/ })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Card B/ })).toBeInTheDocument()
  })

  it('retries after board fetch error', async () => {
    const user = userEvent.setup()
    let attempts = 0
    server.use(
      http.get(`http://localhost:3334/boards/${BOARD_ID}`, () => {
        attempts += 1
        if (attempts === 1) {
          return HttpResponse.json(
            { error: 'InternalServerError', code: 'INTERNAL_ERROR', message: 'Cold start' },
            { status: 500 },
          )
        }
        return HttpResponse.json({
          id: BOARD_ID,
          title: 'Board de teste',
          lists: [],
        })
      }),
    )

    renderBoardPage(BOARD_ID)
    expect(await screen.findByText('Board indisponível')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('button', { name: 'Board de teste' })).toBeInTheDocument()
  })
})
