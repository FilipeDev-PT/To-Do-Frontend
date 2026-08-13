import type { BoardDetails, Card } from '@/entities/board'

export function reorderBoardCards(
  board: BoardDetails,
  cardId: string,
  toListId: string,
  toPosition: number,
): BoardDetails {
  let movingCard: Card | undefined

  const listsWithoutCard = board.lists.map((list) => {
    const remaining = list.cards.filter((card) => {
      if (card.id === cardId) {
        movingCard = card
        return false
      }
      return true
    })
    return {
      ...list,
      cards: remaining.map((card, index) => ({ ...card, position: index })),
    }
  })

  if (!movingCard) return board

  const cardToMove = movingCard

  return {
    ...board,
    lists: listsWithoutCard.map((list) => {
      if (list.id !== toListId) return list
      const nextCards = [...list.cards]
      const updatedCard: Card = {
        ...cardToMove,
        listId: toListId,
        position: toPosition,
      }
      nextCards.splice(toPosition, 0, updatedCard)
      return {
        ...list,
        cards: nextCards.map((card, index) => ({ ...card, position: index })),
      }
    }),
  }
}
