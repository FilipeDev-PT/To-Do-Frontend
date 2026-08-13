import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test'

export const API_URL = 'https://to-do-backend-c6t5.onrender.com'

type Fixtures = {
  api: APIRequestContext
  unique: string
}

async function waitForApi(api: APIRequestContext) {
  let lastError: unknown
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const health = await api.get('/healthz')
      if (health.ok()) {
        const boards = await api.get('/boards')
        if (boards.ok()) return
      }
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 4000))
  }
  throw new Error(`API QA indisponível após retries: ${String(lastError)}`)
}

export const test = base.extend<Fixtures>({
  unique: async ({}, use) => {
    await use(`${Date.now()}-${Math.floor(Math.random() * 1000)}`)
  },
  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 90_000,
    })
    await waitForApi(context)
    await use(context)
    await context.dispose()
  },
})

export { expect }

export async function createBoard(api: APIRequestContext, title: string) {
  const response = await api.post('/boards', { data: { title } })
  expect(response.ok(), await response.text()).toBeTruthy()
  return (await response.json()) as { id: string; title: string }
}

export async function deleteBoard(api: APIRequestContext, boardId: string) {
  try {
    const response = await api.delete(`/boards/${boardId}`)
    // QA no Render pode responder 5xx ocasionalmente no cleanup.
    if (![204, 404, 500].includes(response.status())) {
      throw new Error(`Falha ao apagar board ${boardId}: ${response.status()}`)
    }
  } catch {
    // best-effort cleanup
  }
}

export async function dragCardToColumn(page: Page, cardName: RegExp, columnTitle: string) {
  const card = page.getByRole('button', { name: cardName })
  const column = page.locator('section').filter({
    has: page.getByRole('button', { name: columnTitle }),
  })
  await expect(card).toBeVisible()
  await expect(column).toBeVisible()

  const cardBox = await card.boundingBox()
  const columnBox = await column.boundingBox()
  if (!cardBox || !columnBox) {
    throw new Error('Não foi possível obter bounding boxes para drag-and-drop')
  }

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2 + 12, {
    steps: 5,
  })
  await page.mouse.move(columnBox.x + columnBox.width / 2, columnBox.y + 140, { steps: 30 })
  await page.mouse.up()
}
