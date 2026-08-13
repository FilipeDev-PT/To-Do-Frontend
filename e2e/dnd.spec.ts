import { createBoard, deleteBoard, dragCardToColumn, expect, test } from './helpers'

test.describe.configure({ mode: 'serial' })

test.describe('DnD regression', () => {
  let boardId = ''

  test.afterAll(async ({ api }) => {
    if (boardId) await deleteBoard(api, boardId)
  })

  test('arrasta card entre colunas e persiste após reload', async ({ page, api, unique }) => {
    const board = await createBoard(api, `DnD E2E ${unique}`)
    boardId = board.id

    const listA = await api.post(`/boards/${boardId}/lists`, { data: { title: 'Origem' } })
    const listB = await api.post(`/boards/${boardId}/lists`, { data: { title: 'Destino' } })
    expect(listA.ok(), await listA.text()).toBeTruthy()
    expect(listB.ok(), await listB.text()).toBeTruthy()
    const source = (await listA.json()) as { id: string }
    const cardRes = await api.post(`/lists/${source.id}/cards`, {
      data: { title: `Drag ${unique}`, description: 'mover' },
    })
    expect(cardRes.ok(), await cardRes.text()).toBeTruthy()
    const cardBody = (await cardRes.json()) as { id: string }

    await page.goto(`/boards/${boardId}`)
    await expect(page.getByRole('button', { name: board.title })).toBeVisible({
      timeout: 90_000,
    })

    const moveResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/cards/${cardBody.id}/move`) &&
        response.request().method() === 'POST' &&
        response.ok(),
    )

    await dragCardToColumn(page, new RegExp(`Drag ${unique}`), 'Destino')
    await moveResponse

    const targetColumn = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Destino' }),
    })
    await expect(targetColumn.getByRole('button', { name: new RegExp(`Drag ${unique}`) })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: board.title })).toBeVisible({
      timeout: 90_000,
    })
    await expect(
      page
        .locator('section')
        .filter({ has: page.getByRole('button', { name: 'Destino' }) })
        .getByRole('button', { name: new RegExp(`Drag ${unique}`) }),
    ).toBeVisible()
  })
})
