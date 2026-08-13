import { describe, expect, it } from 'vitest'
import { reorderBoardCards } from '@/features/cards/lib/reorder-board-cards'
import {
  CARD_A_ID,
  CARD_B_ID,
  createBoardDetails,
  LIST_A_ID,
  LIST_B_ID,
} from '@/test/fixtures'

describe('reorderBoardCards', () => {
  it('moves a card to another list and reindexes positions', () => {
    const board = createBoardDetails()
    const next = reorderBoardCards(board, CARD_A_ID, LIST_B_ID, 0)

    const listA = next.lists.find((list) => list.id === LIST_A_ID)!
    const listB = next.lists.find((list) => list.id === LIST_B_ID)!

    expect(listA.cards.map((card) => card.id)).toEqual([CARD_B_ID])
    expect(listA.cards[0]?.position).toBe(0)
    expect(listB.cards.map((card) => card.id)).toEqual([CARD_A_ID])
    expect(listB.cards[0]).toMatchObject({
      id: CARD_A_ID,
      listId: LIST_B_ID,
      position: 0,
    })
  })

  it('reorders a card inside the same list', () => {
    const board = createBoardDetails()
    const next = reorderBoardCards(board, CARD_A_ID, LIST_A_ID, 1)
    const listA = next.lists.find((list) => list.id === LIST_A_ID)!

    expect(listA.cards.map((card) => card.id)).toEqual([CARD_B_ID, CARD_A_ID])
    expect(listA.cards.map((card) => card.position)).toEqual([0, 1])
  })

  it('returns the same board when card does not exist', () => {
    const board = createBoardDetails()
    const next = reorderBoardCards(board, '99999999-9999-4999-8999-999999999999', LIST_B_ID, 0)
    expect(next).toBe(board)
  })
})
