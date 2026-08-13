import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as boardsApi from '@/features/boards/api'
import type { CreateBoardInput, UpdateBoardInput } from '@/entities/board'

export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  detail: (boardId: string) => [...boardKeys.all, 'detail', boardId] as const,
}

export function useBoards() {
  return useQuery({
    queryKey: boardKeys.lists(),
    queryFn: boardsApi.listBoards,
  })
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => boardsApi.getBoard(boardId),
    enabled: Boolean(boardId),
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBoardInput) => boardsApi.createBoard(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() })
    },
  })
}

export function useUpdateBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ boardId, input }: { boardId: string; input: UpdateBoardInput }) =>
      boardsApi.updateBoard(boardId, input),
    onSuccess: (board) => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(board.id) })
    },
  })
}

export function useDeleteBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (boardId: string) => boardsApi.deleteBoard(boardId),
    onSuccess: (_data, boardId) => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() })
      queryClient.removeQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}
