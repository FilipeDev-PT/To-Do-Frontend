import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useState, type FormEvent } from 'react'
import type { Card, ListWithCards } from '@/entities/board'
import { SortableCard } from '@/features/cards/components/SortableCard'
import { Button, Input } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

type BoardColumnProps = {
  list: ListWithCards
  onOpenCard: (card: Card) => void
  onCreateCard: (listId: string, title: string) => Promise<void>
  onRenameList: (listId: string, title: string) => Promise<void>
  onDeleteList: (listId: string) => Promise<void>
  isCreatingCard: boolean
}

export function BoardColumn({
  list,
  onOpenCard,
  onCreateCard,
  onRenameList,
  onDeleteList,
  isCreatingCard,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', list },
  })
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [listTitle, setListTitle] = useState(list.title)

  useEffect(() => {
    setListTitle(list.title)
  }, [list.title])

  const cardIds = list.cards.map((card) => card.id)

  async function handleCreateCard(event: FormEvent) {
    event.preventDefault()
    const next = title.trim()
    if (!next) return
    await onCreateCard(list.id, next)
    setTitle('')
    setIsAdding(false)
  }

  async function handleRename(event?: FormEvent) {
    event?.preventDefault()
    const next = listTitle.trim()
    if (!next || next === list.title) {
      setListTitle(list.title)
      setIsEditingTitle(false)
      return
    }
    await onRenameList(list.id, next)
    setIsEditingTitle(false)
  }

  return (
    <section
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-2xl border border-[var(--line)] bg-[var(--column)]/90',
        isOver && 'ring-2 ring-[var(--accent)]/40',
      )}
    >
      <header className="flex items-start justify-between gap-2 border-b border-[var(--line)] px-3 py-3">
        {isEditingTitle ? (
          <form onSubmit={handleRename} className="flex-1">
            <Input
              value={listTitle}
              onChange={(event) => setListTitle(event.target.value)}
              onBlur={() => void handleRename()}
              autoFocus
            />
          </form>
        ) : (
          <button
            type="button"
            className="flex-1 text-left font-display text-lg text-[var(--ink)]"
            onClick={() => setIsEditingTitle(true)}
          >
            {list.title}
          </button>
        )}
        <Button
          variant="ghost"
          className="px-2 py-1 text-xs"
          onClick={() => {
            if (window.confirm('Apagar esta coluna e todos os cards?')) {
              void onDeleteList(list.id)
            }
          }}
        >
          Apagar
        </Button>
      </header>

      <div ref={setNodeRef} className="flex min-h-24 flex-1 flex-col gap-2 p-3">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <SortableCard key={card.id} card={card} onOpen={onOpenCard} />
          ))}
        </SortableContext>

        {list.cards.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--line)] px-3 py-6 text-center text-xs text-[var(--ink-muted)]">
            Arraste um card aqui
          </p>
        ) : null}
      </div>

      <footer className="border-t border-[var(--line)] p-3">
        {isAdding ? (
          <form onSubmit={handleCreateCard} className="space-y-2">
            <Input
              placeholder="Título do card"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isCreatingCard || !title.trim()}>
                Adicionar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAdding(false)
                  setTitle('')
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => setIsAdding(true)}>
            + Novo card
          </Button>
        )}
      </footer>
    </section>
  )
}
