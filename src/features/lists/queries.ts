import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as listsApi from '@/features/lists/api'
import { boardKeys } from '@/features/boards'
import type { CreateListInput, UpdateListInput } from '@/entities/board'

export function useCreateList(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateListInput) => listsApi.createList(boardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}

export function useUpdateList(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, input }: { listId: string; input: UpdateListInput }) =>
      listsApi.updateList(listId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}

export function useDeleteList(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (listId: string) => listsApi.deleteList(listId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}
