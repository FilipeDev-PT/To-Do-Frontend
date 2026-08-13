import { httpClient } from '@/shared/api/http-client'
import type { Board, BoardDetails, CreateBoardInput, UpdateBoardInput } from '@/entities/board'

export function listBoards() {
  return httpClient<Board[]>('/boards')
}

export function getBoard(boardId: string) {
  return httpClient<BoardDetails>(`/boards/${boardId}`)
}

export function createBoard(input: CreateBoardInput) {
  return httpClient<Board>('/boards', { method: 'POST', body: input })
}

export function updateBoard(boardId: string, input: UpdateBoardInput) {
  return httpClient<Board>(`/boards/${boardId}`, { method: 'PATCH', body: input })
}

export function deleteBoard(boardId: string) {
  return httpClient<void>(`/boards/${boardId}`, { method: 'DELETE' })
}
