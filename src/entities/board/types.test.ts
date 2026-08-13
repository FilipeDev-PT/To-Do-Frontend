import { describe, expect, it } from 'vitest'
import {
  createBoardSchema,
  createCardSchema,
  moveCardSchema,
  updateCardSchema,
  updateListSchema,
} from '@/entities/board'

describe('board schemas', () => {
  it('accepts valid createBoard title', () => {
    expect(createBoardSchema.parse({ title: '  Sprint  ' })).toEqual({ title: 'Sprint' })
  })

  it('rejects empty createBoard title', () => {
    const result = createBoardSchema.safeParse({ title: '   ' })
    expect(result.success).toBe(false)
  })

  it('accepts createCard with optional description', () => {
    expect(createCardSchema.parse({ title: 'Task', description: 'Detalhe' })).toEqual({
      title: 'Task',
      description: 'Detalhe',
    })
  })

  it('requires at least one field on updateCard', () => {
    expect(updateCardSchema.safeParse({}).success).toBe(false)
    expect(updateCardSchema.parse({ description: 'x' })).toEqual({ description: 'x' })
  })

  it('requires at least one field on updateList', () => {
    expect(updateListSchema.safeParse({}).success).toBe(false)
    expect(updateListSchema.parse({ title: 'Coluna' })).toEqual({ title: 'Coluna' })
  })

  it('validates moveCard payload', () => {
    const listId = '22222222-2222-4222-8222-222222222222'
    expect(moveCardSchema.parse({ listId, position: 0 })).toEqual({ listId, position: 0 })
    expect(moveCardSchema.safeParse({ listId: 'nope', position: 0 }).success).toBe(false)
    expect(moveCardSchema.safeParse({ listId, position: -1 }).success).toBe(false)
  })
})
