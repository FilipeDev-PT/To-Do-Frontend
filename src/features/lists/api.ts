import { httpClient } from '@/shared/api/http-client'
import type { CreateListInput, List, UpdateListInput } from '@/entities/board'

export function createList(boardId: string, input: CreateListInput) {
  return httpClient<List>(`/boards/${boardId}/lists`, { method: 'POST', body: input })
}

export function updateList(listId: string, input: UpdateListInput) {
  return httpClient<List>(`/lists/${listId}`, { method: 'PATCH', body: input })
}

export function deleteList(listId: string) {
  return httpClient<void>(`/lists/${listId}`, { method: 'DELETE' })
}
