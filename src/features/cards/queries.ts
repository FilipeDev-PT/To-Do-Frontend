import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as cardsApi from '@/features/cards/api'
import { reorderBoardCards } from '@/features/cards/lib/reorder-board-cards'
import { boardKeys } from '@/features/boards'
import type {
  BoardDetails,
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
} from '@/entities/board'

export function useCreateCard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, input }: { listId: string; input: CreateCardInput }) =>
      cardsApi.createCard(listId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}

export function useUpdateCard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, input }: { cardId: string; input: UpdateCardInput }) =>
      cardsApi.updateCard(cardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}

export function useDeleteCard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: string) => cardsApi.deleteCard(cardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, input }: { cardId: string; input: MoveCardInput }) =>
      cardsApi.moveCard(cardId, input),
    onMutate: async ({ cardId, input }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) })
      const previous = queryClient.getQueryData<BoardDetails>(boardKeys.detail(boardId))
      if (previous) {
        queryClient.setQueryData(
          boardKeys.detail(boardId),
          reorderBoardCards(previous, cardId, input.listId, input.position),
        )
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardKeys.detail(boardId), context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}
