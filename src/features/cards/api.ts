import { httpClient } from '@/shared/api/http-client'
import type { Card, CreateCardInput, MoveCardInput, UpdateCardInput } from '@/entities/board'

export function createCard(listId: string, input: CreateCardInput) {
  return httpClient<Card>(`/lists/${listId}/cards`, { method: 'POST', body: input })
}

export function updateCard(cardId: string, input: UpdateCardInput) {
  return httpClient<Card>(`/cards/${cardId}`, { method: 'PATCH', body: input })
}

export function deleteCard(cardId: string) {
  return httpClient<void>(`/cards/${cardId}`, { method: 'DELETE' })
}

export function moveCard(cardId: string, input: MoveCardInput) {
  return httpClient<Card>(`/cards/${cardId}/move`, { method: 'POST', body: input })
}
