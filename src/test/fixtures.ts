import type { Board, BoardDetails, Card, ListWithCards } from '@/entities/board'

export const BOARD_ID = '11111111-1111-4111-8111-111111111111'
export const LIST_A_ID = '22222222-2222-4222-8222-222222222222'
export const LIST_B_ID = '33333333-3333-4333-8333-333333333333'
export const CARD_A_ID = '44444444-4444-4444-8444-444444444444'
export const CARD_B_ID = '55555555-5555-4555-8555-555555555555'

export function createCard(overrides: Partial<Card> & Pick<Card, 'id' | 'listId' | 'title'>): Card {
  return {
    description: '',
    position: 0,
    ...overrides,
  }
}

export function createList(
  overrides: Partial<ListWithCards> & Pick<ListWithCards, 'id' | 'boardId' | 'title'>,
): ListWithCards {
  return {
    position: 0,
    cards: [],
    ...overrides,
  }
}

export function createBoardSummary(overrides?: Partial<Board>): Board {
  return {
    id: BOARD_ID,
    title: 'Board de teste',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createBoardDetails(overrides?: Partial<BoardDetails>): BoardDetails {
  const board = createBoardSummary()
  return {
    ...board,
    lists: [
      createList({
        id: LIST_A_ID,
        boardId: BOARD_ID,
        title: 'A Fazer',
        position: 0,
        cards: [
          createCard({
            id: CARD_A_ID,
            listId: LIST_A_ID,
            title: 'Card A',
            description: 'Desc A',
            position: 0,
          }),
          createCard({
            id: CARD_B_ID,
            listId: LIST_A_ID,
            title: 'Card B',
            position: 1,
          }),
        ],
      }),
      createList({
        id: LIST_B_ID,
        boardId: BOARD_ID,
        title: 'Feito',
        position: 1,
        cards: [],
      }),
    ],
    ...overrides,
  }
}
