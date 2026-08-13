import { createBoard, deleteBoard, expect, test } from './helpers'

test.describe.configure({ mode: 'serial' })

test.describe('Kanban regression', () => {
  let boardId = ''

  test.afterAll(async ({ api }) => {
    if (boardId) await deleteBoard(api, boardId)
  })

  test('cria colunas, cards e edita no modal', async ({ page, api, unique }) => {
    const board = await createBoard(api, `Kanban E2E ${unique}`)
    boardId = board.id

    await page.goto(`/boards/${boardId}`)
    await expect(page.getByRole('button', { name: board.title })).toBeVisible({
      timeout: 90_000,
    })

    await page.getByPlaceholder('Ex.: Em progresso').fill('Backlog')
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/boards/${boardId}/lists`) &&
          response.request().method() === 'POST' &&
          response.ok(),
      ),
      page.getByRole('button', { name: 'Adicionar coluna' }).click(),
    ])
    await expect(page.getByRole('button', { name: 'Backlog' })).toBeVisible()

    await page.getByPlaceholder('Ex.: Em progresso').fill('Done')
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/boards/${boardId}/lists`) &&
          response.request().method() === 'POST' &&
          response.ok(),
      ),
      page.getByRole('button', { name: 'Adicionar coluna' }).click(),
    ])
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible()

    const backlog = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Backlog' }),
    })
    await backlog.getByRole('button', { name: '+ Novo card' }).click()
    await backlog.getByPlaceholder('Título do card').fill(`Card ${unique}`)
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/cards') &&
          response.request().method() === 'POST' &&
          response.ok(),
      ),
      backlog.getByRole('button', { name: 'Adicionar' }).click(),
    ])
    await expect(page.getByRole('button', { name: new RegExp(`Card ${unique}`) })).toBeVisible()

    await page.getByRole('button', { name: new RegExp(`Card ${unique}`) }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Título').fill(`Card Editado ${unique}`)
    await dialog.getByLabel('Descrição').fill('Descrição E2E')
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/cards/') &&
          response.request().method() === 'PATCH' &&
          response.ok(),
      ),
      dialog.getByRole('button', { name: 'Salvar' }).click(),
    ])

    await expect(page.getByRole('button', { name: new RegExp(`Card Editado ${unique}`) })).toBeVisible()
    await expect(page.getByText('Descrição E2E')).toBeVisible()
  })
})
