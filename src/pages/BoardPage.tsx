import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Card } from '@/entities/board'
import { useBoard, useUpdateBoard } from '@/features/boards'
import { CardModal } from '@/features/cards/components/CardModal'
import { KanbanBoard } from '@/features/cards/components/KanbanBoard'
import { ApiError } from '@/shared/api/api-error'
import { Button, Input, Spinner } from '@/shared/ui'

export function BoardPage() {
  const { boardId = '' } = useParams()
  const { data: board, isLoading, isError, error, refetch, isFetching } = useBoard(boardId)
  const updateBoard = useUpdateBoard()
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : 'Não foi possível carregar o board. Se estiver em QA, o servidor pode estar iniciando.'

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !board) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="font-display text-2xl text-[var(--ink)]">Board indisponível</p>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">{errorMessage}</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => void refetch()} disabled={isFetching}>
            Tentar novamente
          </Button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white/80 px-3.5 py-2 text-sm font-medium text-[var(--ink)]"
          >
            Voltar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--line)] bg-white/50 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link to="/" className="text-sm text-[var(--accent)] hover:underline">
              ← Boards
            </Link>
            {isEditingTitle ? (
              <form
                className="mt-1 flex max-w-xl gap-2"
                onSubmit={async (event) => {
                  event.preventDefault()
                  const title = titleDraft.trim()
                  if (!title) return
                  await updateBoard.mutateAsync({ boardId: board.id, input: { title } })
                  setIsEditingTitle(false)
                }}
              >
                <Input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  autoFocus
                />
                <Button type="submit" disabled={updateBoard.isPending}>
                  Salvar
                </Button>
                <Button variant="ghost" onClick={() => setIsEditingTitle(false)}>
                  Cancelar
                </Button>
              </form>
            ) : (
              <button
                type="button"
                className="mt-1 block truncate text-left font-display text-3xl text-[var(--ink)]"
                onClick={() => {
                  setTitleDraft(board.title)
                  setIsEditingTitle(true)
                }}
              >
                {board.title}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6">
        <KanbanBoard board={board} onOpenCard={setSelectedCard} />
      </main>

      <CardModal
        boardId={board.id}
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  )
}
