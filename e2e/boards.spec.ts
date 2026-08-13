import { createBoard, deleteBoard, expect, test } from './helpers'

test.describe.configure({ mode: 'serial' })

test.describe('Boards regression', () => {
  const createdIds: string[] = []

  test.afterAll(async ({ api }) => {
    for (const id of createdIds) {
      await deleteBoard(api, id)
    }
  })

  test('cria, renomeia e apaga um board', async ({ page, api, unique }) => {
    const boardTitle = `Board E2E ${unique}`
    const renamedTitle = `Board E2E Renomeado ${unique}`

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Seus boards' })).toBeVisible({
      timeout: 90_000,
    })

    await page.getByRole('button', { name: '+ Novo board' }).first().click()
    await page.getByLabel('Título').fill(boardTitle)

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/boards') &&
        response.request().method() === 'POST' &&
        response.status() === 201,
    )
    await page.getByRole('button', { name: 'Criar' }).click()
    const created = await createResponse
    const body = (await created.json()) as { id: string }
    createdIds.push(body.id)

    await expect(page.getByRole('heading', { name: boardTitle })).toBeVisible()

    const card = page.locator('li').filter({ hasText: boardTitle })
    await card.getByRole('button', { name: 'Renomear' }).click()
    await page.getByRole('dialog').getByLabel('Título').fill(renamedTitle)

    const patchResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/boards/${body.id}`) &&
        response.request().method() === 'PATCH' &&
        response.ok(),
    )
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click()
    await patchResponse
    await expect(page.getByRole('heading', { name: renamedTitle })).toBeVisible()

    page.once('dialog', (dialog) => dialog.accept())
    const deleteResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/boards/${body.id}`) &&
        response.request().method() === 'DELETE' &&
        response.status() === 204,
    )
    await page
      .locator('li')
      .filter({ hasText: renamedTitle })
      .getByRole('button', { name: 'Apagar' })
      .click()
    await deleteResponse
    await expect(page.getByRole('heading', { name: renamedTitle })).toHaveCount(0)
    createdIds.splice(createdIds.indexOf(body.id), 1)
  })

  test('abre board pela lista', async ({ page, api, unique }) => {
    const title = `Board Nav ${unique}`
    const board = await createBoard(api, title)
    createdIds.push(board.id)

    await page.goto('/')
    await expect(page.getByRole('heading', { name: title })).toBeVisible({ timeout: 90_000 })
    await page.getByRole('heading', { name: title }).click()
    await expect(page.getByRole('button', { name: title })).toBeVisible()
    await expect(page.getByText('Nova coluna')).toBeVisible()

    await deleteBoard(api, board.id)
    createdIds.splice(createdIds.indexOf(board.id), 1)
  })
})
