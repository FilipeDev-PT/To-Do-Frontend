import { http, HttpResponse } from 'msw'
import type { Board, BoardDetails, Card, ListWithCards } from '@/entities/board'
import {
  BOARD_ID,
  createBoardDetails,
  createBoardSummary,
  createCard,
  createList,
} from '@/test/fixtures'

const API = 'http://localhost:3334'

type Db = {
  boards: Board[]
  details: Record<string, BoardDetails>
}

function createDb(): Db {
  const details = createBoardDetails()
  return {
    boards: [createBoardSummary()],
    details: { [BOARD_ID]: details },
  }
}

let db = createDb()

export function resetDb() {
  db = createDb()
}

export function getDb() {
  return db
}

export const handlers = [
  http.get(`${API}/boards`, () => HttpResponse.json(db.boards)),

  http.get(`${API}/boards/:boardId`, ({ params }) => {
    const board = db.details[String(params.boardId)]
    if (!board) {
      return HttpResponse.json(
        { error: 'NotFoundError', code: 'NOT_FOUND', message: 'Board não encontrado' },
        { status: 404 },
      )
    }
    return HttpResponse.json(board)
  }),

  http.post(`${API}/boards`, async ({ request }) => {
    const body = (await request.json()) as { title: string }
    const board = createBoardSummary({
      id: crypto.randomUUID(),
      title: body.title,
    })
    db.boards.push(board)
    db.details[board.id] = { ...board, lists: [] }
    return HttpResponse.json(board, { status: 201 })
  }),

  http.patch(`${API}/boards/:boardId`, async ({ params, request }) => {
    const boardId = String(params.boardId)
    const body = (await request.json()) as { title: string }
    const summary = db.boards.find((board) => board.id === boardId)
    const details = db.details[boardId]
    if (!summary || !details) {
      return HttpResponse.json(
        { error: 'NotFoundError', code: 'NOT_FOUND', message: 'Board não encontrado' },
        { status: 404 },
      )
    }
    summary.title = body.title
    details.title = body.title
    return HttpResponse.json(summary)
  }),

  http.delete(`${API}/boards/:boardId`, ({ params }) => {
    const boardId = String(params.boardId)
    db.boards = db.boards.filter((board) => board.id !== boardId)
    delete db.details[boardId]
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/boards/:boardId/lists`, async ({ params, request }) => {
    const boardId = String(params.boardId)
    const board = db.details[boardId]
    if (!board) {
      return HttpResponse.json(
        { error: 'NotFoundError', code: 'NOT_FOUND', message: 'Board não encontrado' },
        { status: 404 },
      )
    }
    const body = (await request.json()) as { title: string }
    const list = createList({
      id: crypto.randomUUID(),
      boardId,
      title: body.title,
      position: board.lists.length,
      cards: [],
    })
    board.lists.push(list)
    return HttpResponse.json(list, { status: 201 })
  }),

  http.patch(`${API}/lists/:listId`, async ({ params, request }) => {
    const listId = String(params.listId)
    const body = (await request.json()) as { title?: string; position?: number }
    for (const board of Object.values(db.details)) {
      const list = board.lists.find((item) => item.id === listId)
      if (!list) continue
      if (body.title !== undefined) list.title = body.title
      if (body.position !== undefined) list.position = body.position
      return HttpResponse.json(list)
    }
    return HttpResponse.json(
      { error: 'NotFoundError', code: 'NOT_FOUND', message: 'List não encontrada' },
      { status: 404 },
    )
  }),

  http.delete(`${API}/lists/:listId`, ({ params }) => {
    const listId = String(params.listId)
    for (const board of Object.values(db.details)) {
      const before = board.lists.length
      board.lists = board.lists.filter((list) => list.id !== listId)
      if (board.lists.length !== before) {
        return new HttpResponse(null, { status: 204 })
      }
    }
    return HttpResponse.json(
      { error: 'NotFoundError', code: 'NOT_FOUND', message: 'List não encontrada' },
      { status: 404 },
    )
  }),

  http.post(`${API}/lists/:listId/cards`, async ({ params, request }) => {
    const listId = String(params.listId)
    const body = (await request.json()) as { title: string; description?: string }
    for (const board of Object.values(db.details)) {
      const list = board.lists.find((item) => item.id === listId)
      if (!list) continue
      const card = createCard({
        id: crypto.randomUUID(),
        listId,
        title: body.title,
        description: body.description ?? '',
        position: list.cards.length,
      })
      list.cards.push(card)
      return HttpResponse.json(card, { status: 201 })
    }
    return HttpResponse.json(
      { error: 'NotFoundError', code: 'NOT_FOUND', message: 'List não encontrada' },
      { status: 404 },
    )
  }),

  http.patch(`${API}/cards/:cardId`, async ({ params, request }) => {
    const cardId = String(params.cardId)
    const body = (await request.json()) as { title?: string; description?: string }
    for (const board of Object.values(db.details)) {
      for (const list of board.lists) {
        const card = list.cards.find((item) => item.id === cardId)
        if (!card) continue
        if (body.title !== undefined) card.title = body.title
        if (body.description !== undefined) card.description = body.description
        return HttpResponse.json(card)
      }
    }
    return HttpResponse.json(
      { error: 'NotFoundError', code: 'NOT_FOUND', message: 'Card não encontrado' },
      { status: 404 },
    )
  }),

  http.delete(`${API}/cards/:cardId`, ({ params }) => {
    const cardId = String(params.cardId)
    for (const board of Object.values(db.details)) {
      for (const list of board.lists) {
        const before = list.cards.length
        list.cards = list.cards.filter((card) => card.id !== cardId)
        if (list.cards.length !== before) {
          return new HttpResponse(null, { status: 204 })
        }
      }
    }
    return HttpResponse.json(
      { error: 'NotFoundError', code: 'NOT_FOUND', message: 'Card não encontrado' },
      { status: 404 },
    )
  }),

  http.post(`${API}/cards/:cardId/move`, async ({ params, request }) => {
    const cardId = String(params.cardId)
    const body = (await request.json()) as { listId: string; position: number }
    let moving: Card | undefined
    let sourceList: ListWithCards | undefined

    for (const board of Object.values(db.details)) {
      for (const list of board.lists) {
        const index = list.cards.findIndex((card) => card.id === cardId)
        if (index < 0) continue
        ;[moving] = list.cards.splice(index, 1)
        sourceList = list
        list.cards = list.cards.map((card, position) => ({ ...card, position }))
        break
      }
      if (!moving) continue

      const target = board.lists.find((list) => list.id === body.listId)
      if (!target || !sourceList) {
        return HttpResponse.json(
          { error: 'DomainError', code: 'DOMAIN_ERROR', message: 'Lista inválida' },
          { status: 422 },
        )
      }
      const updated = { ...moving, listId: body.listId, position: body.position }
      target.cards.splice(body.position, 0, updated)
      target.cards = target.cards.map((card, position) => ({ ...card, position }))
      return HttpResponse.json(updated)
    }

    return HttpResponse.json(
      { error: 'NotFoundError', code: 'NOT_FOUND', message: 'Card não encontrado' },
      { status: 404 },
    )
  }),
]
