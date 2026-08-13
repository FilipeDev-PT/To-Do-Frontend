import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { createBoardSchema, type CreateBoardInput } from '@/entities/board'
import { useBoards, useCreateBoard, useDeleteBoard, useUpdateBoard } from '@/features/boards'
import { ApiError } from '@/shared/api/api-error'
import { Button, EmptyState, Input, Modal, Spinner } from '@/shared/ui'

export function BoardsPage() {
  const { data: boards, isLoading, isError, error, refetch, isFetching } = useBoards()
  const createBoard = useCreateBoard()
  const updateBoard = useUpdateBoard()
  const deleteBoard = useDeleteBoard()

  const [createOpen, setCreateOpen] = useState(false)
  const [renameId, setRenameId] = useState<string | null>(null)

  const createForm = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { title: '' },
  })

  const renameForm = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { title: '' },
  })

  async function handleCreate(values: CreateBoardInput) {
    await createBoard.mutateAsync(values)
    createForm.reset()
    setCreateOpen(false)
  }

  async function handleRename(values: CreateBoardInput) {
    if (!renameId) return
    await updateBoard.mutateAsync({ boardId: renameId, input: values })
    renameForm.reset()
    setRenameId(null)
  }

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : 'Não foi possível carregar os boards. Se estiver em QA, o servidor pode estar iniciando.'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-[var(--accent)]">To-Do</p>
          <h1 className="font-display text-4xl text-[var(--ink)] md:text-5xl">Seus boards</h1>
          <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
            Organize listas e cards no estilo Kanban. Arraste os cards entre colunas no board.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Novo board</Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-[var(--danger)]/30 bg-white/70 p-6">
          <p className="font-medium text-[var(--ink)]">Falha ao carregar</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{errorMessage}</p>
          <Button className="mt-4" onClick={() => void refetch()} disabled={isFetching}>
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && boards?.length === 0 ? (
        <EmptyState
          title="Nenhum board ainda"
          description="Crie o primeiro board para começar a organizar suas tarefas."
          action={<Button onClick={() => setCreateOpen(true)}>Criar board</Button>}
        />
      ) : null}

      {!isLoading && !isError && boards && boards.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li
              key={board.id}
              className="rounded-2xl border border-[var(--line)] bg-white/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link to={`/boards/${board.id}`} className="block">
                <h2 className="font-display text-2xl text-[var(--ink)]">{board.title}</h2>
                {board.createdAt ? (
                  <p className="mt-2 text-xs text-[var(--ink-muted)]">
                    Criado em {new Date(board.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                ) : null}
              </Link>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setRenameId(board.id)
                    renameForm.reset({ title: board.title })
                  }}
                >
                  Renomear
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm(`Apagar o board "${board.title}"?`)) {
                      void deleteBoard.mutateAsync(board.id)
                    }
                  }}
                >
                  Apagar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Modal
        open={createOpen}
        title="Novo board"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              form="create-board-form"
              type="submit"
              disabled={createBoard.isPending || createForm.formState.isSubmitting}
            >
              Criar
            </Button>
          </>
        }
      >
        <form
          id="create-board-form"
          className="space-y-3"
          onSubmit={createForm.handleSubmit(handleCreate)}
        >
          <Input
            label="Título"
            placeholder="Ex.: Sprint atual"
            error={createForm.formState.errors.title?.message}
            {...createForm.register('title')}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(renameId)}
        title="Renomear board"
        onClose={() => setRenameId(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenameId(null)}>
              Cancelar
            </Button>
            <Button
              form="rename-board-form"
              type="submit"
              disabled={updateBoard.isPending || renameForm.formState.isSubmitting}
            >
              Salvar
            </Button>
          </>
        }
      >
        <form
          id="rename-board-form"
          className="space-y-3"
          onSubmit={renameForm.handleSubmit(handleRename)}
        >
          <Input
            label="Título"
            error={renameForm.formState.errors.title?.message}
            {...renameForm.register('title')}
          />
        </form>
      </Modal>
    </div>
  )
}
