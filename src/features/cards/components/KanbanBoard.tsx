import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { BoardDetails, Card, ListWithCards } from '@/entities/board'
import { BoardColumn } from '@/features/cards/components/BoardColumn'
import { CardPreview } from '@/features/cards/components/SortableCard'
import { useCreateCard, useMoveCard } from '@/features/cards'
import { useCreateList, useDeleteList, useUpdateList } from '@/features/lists'
import { Button, Input } from '@/shared/ui'

type KanbanBoardProps = {
  board: BoardDetails
  onOpenCard: (card: Card) => void
}

function findListByCardId(lists: ListWithCards[], cardId: string) {
  return lists.find((list) => list.cards.some((card) => card.id === cardId))
}

function cloneLists(lists: ListWithCards[]) {
  return lists.map((list) => ({
    ...list,
    cards: list.cards.map((card) => ({ ...card })),
  }))
}

export function KanbanBoard({ board, onOpenCard }: KanbanBoardProps) {
  const [lists, setLists] = useState<ListWithCards[]>(() => cloneLists(board.lists))
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [newListTitle, setNewListTitle] = useState('')

  const createCard = useCreateCard(board.id)
  const moveCard = useMoveCard(board.id)
  const createList = useCreateList(board.id)
  const updateList = useUpdateList(board.id)
  const deleteList = useDeleteList(board.id)

  useEffect(() => {
    setLists(cloneLists(board.lists))
  }, [board])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const cardMap = useMemo(() => {
    const map = new Map<string, Card>()
    for (const list of lists) {
      for (const card of list.cards) map.set(card.id, card)
    }
    return map
  }, [lists])

  function handleDragStart(event: DragStartEvent) {
    const card = cardMap.get(String(event.active.id))
    setActiveCard(card ?? null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    const activeList = findListByCardId(lists, activeId)
    const overList =
      lists.find((list) => list.id === overId) ?? findListByCardId(lists, overId)

    if (!activeList || !overList || activeList.id === overList.id) return

    setLists((prev) => {
      const next = cloneLists(prev)
      const fromList = next.find((list) => list.id === activeList.id)
      const toList = next.find((list) => list.id === overList.id)
      if (!fromList || !toList) return prev

      const fromIndex = fromList.cards.findIndex((card) => card.id === activeId)
      if (fromIndex < 0) return prev

      const [moved] = fromList.cards.splice(fromIndex, 1)
      const overIndex = toList.cards.findIndex((card) => card.id === overId)
      const insertIndex = overIndex >= 0 ? overIndex : toList.cards.length
      toList.cards.splice(insertIndex, 0, { ...moved, listId: toList.id })

      fromList.cards = fromList.cards.map((card, index) => ({ ...card, position: index }))
      toList.cards = toList.cards.map((card, index) => ({ ...card, position: index }))
      return next
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)

    if (!over) {
      setLists(cloneLists(board.lists))
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)
    const next = cloneLists(lists)
    const activeList = findListByCardId(next, activeId)
    if (!activeList) {
      setLists(cloneLists(board.lists))
      return
    }

    const overList =
      next.find((list) => list.id === overId) ?? findListByCardId(next, overId)
    if (!overList) {
      setLists(cloneLists(board.lists))
      return
    }

    const oldIndex = activeList.cards.findIndex((card) => card.id === activeId)
    if (oldIndex < 0) return

    if (activeList.id === overList.id) {
      const newIndex =
        overId === overList.id
          ? overList.cards.length - 1
          : overList.cards.findIndex((card) => card.id === overId)

      if (newIndex < 0) return

      if (oldIndex !== newIndex) {
        activeList.cards = arrayMove(activeList.cards, oldIndex, newIndex).map((card, index) => ({
          ...card,
          position: index,
          listId: activeList.id,
        }))
        setLists(next)
      }

      void moveCard.mutateAsync({
        cardId: activeId,
        input: { listId: activeList.id, position: newIndex },
      })
      return
    }

    const toIndex = overList.cards.findIndex((card) => card.id === activeId)
    const position = toIndex >= 0 ? toIndex : overList.cards.length
    setLists(next)
    void moveCard.mutateAsync({
      cardId: activeId,
      input: { listId: overList.id, position },
    })
  }

  async function handleCreateList(event: FormEvent) {
    event.preventDefault()
    const title = newListTitle.trim()
    if (!title) return
    await createList.mutateAsync({ title })
    setNewListTitle('')
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveCard(null)
        setLists(cloneLists(board.lists))
      }}
    >
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {lists.map((list) => (
          <BoardColumn
            key={list.id}
            list={list}
            onOpenCard={onOpenCard}
            isCreatingCard={createCard.isPending}
            onCreateCard={async (listId, title) => {
              await createCard.mutateAsync({ listId, input: { title } })
            }}
            onRenameList={async (listId, title) => {
              await updateList.mutateAsync({ listId, input: { title } })
            }}
            onDeleteList={async (listId) => {
              await deleteList.mutateAsync(listId)
            }}
          />
        ))}

        <form
          onSubmit={handleCreateList}
          className="w-72 shrink-0 rounded-2xl border border-dashed border-[var(--line)] bg-white/40 p-3"
        >
          <p className="mb-2 font-display text-lg text-[var(--ink)]">Nova coluna</p>
          <Input
            placeholder="Ex.: Em progresso"
            value={newListTitle}
            onChange={(event) => setNewListTitle(event.target.value)}
          />
          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={createList.isPending || !newListTitle.trim()}
          >
            Adicionar coluna
          </Button>
        </form>
      </div>

      <DragOverlay>{activeCard ? <CardPreview card={activeCard} /> : null}</DragOverlay>
    </DndContext>
  )
}
