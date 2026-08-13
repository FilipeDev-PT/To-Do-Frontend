import { z } from 'zod'

export const boardSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.string().optional(),
})

export const cardSchema = z.object({
  id: z.string().uuid(),
  listId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  position: z.number().int(),
})

export const listSchema = z.object({
  id: z.string().uuid(),
  boardId: z.string().uuid(),
  title: z.string(),
  position: z.number().int(),
})

export const listWithCardsSchema = listSchema.extend({
  cards: z.array(cardSchema),
})

export const boardDetailsSchema = boardSchema.extend({
  lists: z.array(listWithCardsSchema),
})

export type Board = z.infer<typeof boardSchema>
export type Card = z.infer<typeof cardSchema>
export type List = z.infer<typeof listSchema>
export type ListWithCards = z.infer<typeof listWithCardsSchema>
export type BoardDetails = z.infer<typeof boardDetailsSchema>

export const createBoardSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título'),
})

export const updateBoardSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título'),
})

export const createListSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título'),
  position: z.number().int().min(0).optional(),
})

export const updateListSchema = z
  .object({
    title: z.string().trim().min(1, 'Informe um título').optional(),
    position: z.number().int().min(0).optional(),
  })
  .refine((data) => data.title !== undefined || data.position !== undefined, {
    message: 'Informe título ou posição',
  })

export const createCardSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título'),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
})

export const updateCardSchema = z
  .object({
    title: z.string().trim().min(1, 'Informe um título').optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: 'Informe título ou descrição',
  })

export const moveCardSchema = z.object({
  listId: z.string().uuid(),
  position: z.number().int().min(0),
})

export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>
export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type MoveCardInput = z.infer<typeof moveCardSchema>
