# Documentação técnica — To-Do Frontend

Arquitetura, dados, roteamento, ambientes, testes e deploy.

Para instalar e usar a UI, veja [`uso.md`](./uso.md).

## Objetivo e escopo

SPA Kanban consumindo a API REST do To-Do-Backend. Sem auth no cliente; estado de servidor via TanStack Query.

## Stack

| Área | Tecnologia |
|---|---|
| Build | Vite 8 + TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Dados | TanStack Query, `fetch` tipado |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Rotas | React Router (`BrowserRouter`) |
| DnD | `@dnd-kit/core` + sortable |
| Testes | Vitest, RTL, MSW, Playwright |
| Lint | oxlint |

Alias: `@/*` → `src/*`.

## Arquitetura (Feature-Sliced enxuto)

```
src/
  app/          # App shell, providers, router
  pages/        # BoardsPage, BoardPage
  entities/     # schemas Zod + tipos (board/list/card)
  features/     # boards | lists | cards (api + queries + UI Kanban)
  shared/       # http client, env, ui kit, query-client
  test/         # Vitest setup, MSW, fixtures
e2e/            # Playwright
```

### Bootstrap

`main.tsx` → `App` → `AppProviders` (QueryClient) → `AppRouter`.

### Features

Cada feature expõe barrel (`index.ts`):

| Feature | Conteúdo |
|---|---|
| `features/boards` | `api.ts`, `queries.ts` (CRUD boards) |
| `features/lists` | API + mutations de list |
| `features/cards` | API + mutations + `KanbanBoard`, colunas, modal, DnD |

Pages orquestram hooks e componentes; regras de reorder puro ficam em `features/cards/lib/reorder-board-cards.ts`.

### Entities

`entities/board/types.ts` — schemas Zod compartilhados (`Board`, `List`, `Card`, `BoardDetails`, inputs de create/update/move).

### Shared UI

`Button`, `Input`, `Textarea`, `Modal`, `Spinner`, `EmptyState` em `shared/ui/`. Tokens/cores em `src/index.css` (DM Sans + Fraunces, accent teal).

## Ambientes e config

`shared/config/env.ts` exige `VITE_API_URL` e remove trailing `/`.

| Mode | Arquivo | Uso |
|---|---|---|
| `qa` | `.env.qa` | Dev contra Render |
| `development` | `.env.development` | Dev contra localhost:3334 |
| `e2e` | `.env.e2e` | `VITE_API_URL=/api` + proxy Vite |
| `production` | `.env.production` | Build GitHub Pages → Render |

Proxy (`vite.config.ts`): `/api` → `https://to-do-backend-c6t5.onrender.com` (rewrite remove o prefixo `/api`).

Vitest força `VITE_API_URL=http://localhost:3334` em `test.env` para casar com handlers MSW.

## Roteamento e GitHub Pages

`src/app/router.tsx`:

| Path | Página |
|---|---|
| `/` | `BoardsPage` |
| `/boards/:boardId` | `BoardPage` |
| `*` | redirect → `/` |

```ts
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined
```

`vite.config.ts`:

- Dev / preview local sem build: `base: '/'`
- `command === 'build'`: `base: '/To-Do-Frontend/'`

Deep links no Pages: `postbuild` + CI copiam `index.html` → `404.html`.

## Camada de dados

### HTTP client (`shared/api/http-client.ts`)

- `fetch(`${env.apiUrl}${path}`)`
- JSON, headers `Accept` / `Content-Type` / `x-request-id`
- `204` → `undefined`
- Erros → `ApiError` (`shared/api/api-error.ts`)

### Query client (`shared/lib/query-client.ts`)

- `staleTime: 30s`
- `retry: 2` (backoff)
- `refetchOnWindowFocus: false` (amigável a cold start)

### Endpoints por feature

| Feature | Endpoints |
|---|---|
| Boards | `GET/POST /boards`, `GET/PATCH/DELETE /boards/:id` |
| Lists | `POST /boards/:id/lists`, `PATCH/DELETE /lists/:id` |
| Cards | `POST /lists/:id/cards`, `PATCH/DELETE /cards/:id`, `POST /cards/:id/move` |

### Query keys

- `boardKeys.lists()` → `['boards','list']`
- `boardKeys.detail(id)` → `['boards','detail', id]`

Mutations de list/card invalidam o detalhe do board. Mutations de board invalidam a lista (e detalhe quando aplicável).

### Optimistic UI

Somente `useMoveCard`: `onMutate` aplica `reorderBoardCards` no cache; rollback em erro; invalidate no settle.

## UI / fluxos técnicos

### BoardsPage

- `useBoards`, estados loading/error/empty/grid
- Modais RHF + Zod para create/rename
- Delete via `window.confirm`

### BoardPage + Kanban

- `useBoard(boardId)`
- `KanbanBoard`: DndContext (`closestCorners`), PointerSensor (8px/6px threshold), KeyboardSensor, `DragOverlay`
- `onDragOver` — preview cross-list; `onDragEnd` — `useMoveCard`
- `BoardColumn` — droppable + sortable cards + CRUD list/card inline
- `CardModal` — update/delete card

## Testes

### Vitest

| Peça | Path |
|---|---|
| Setup | `src/test/setup.ts` |
| MSW | `handlers.ts`, `server.ts`, `fixtures.ts` |
| Render helper | `test-utils.tsx` (`MemoryRouter` + QueryClient) |
| Coverage include | `shared/**`, `entities/**`, `features/**/lib/**` |
| Threshold | 70% lines |

Exclui `e2e/` do Vitest.

### Playwright

`playwright.config.ts`: Chromium, `webServer: npm run dev:e2e`, porta `5174`, 1 worker, timeout longo (cold start).

Helpers em `e2e/helpers.ts`: wait `/healthz`, CRUD via API QA, utilitário de drag.

## Deploy

Workflow: `.github/workflows/deploy-pages.yml`

1. Checkout + Node 22 + `npm ci`
2. `npm run build` (lê `.env.production`)
3. `cp dist/index.html dist/404.html`
4. Upload artifact + `actions/deploy-pages`

Triggers: push `main`, `workflow_dispatch`.

## Decisões de design relevantes

1. **Proxy só no E2E** — browser Playwright não sofre CORS; QA/dev direto na URL da API.
2. **Basename dinâmico** — um único router serve `/` local e `/To-Do-Frontend` no Pages.
3. **Optimistic move** — DnD precisa de feedback imediato; demais mutations confiam em invalidate.
4. **Sem cards genéricos no layout** — colunas Kanban são o container de interação; design tokens no CSS.

## Extensões naturais

1. Auth + headers no `http-client`
2. Reordenação de lists via DnD
3. Offline / persistência local de rascunho
4. Storybook para `shared/ui`

## Referências rápidas

| Concern | Path |
|---|---|
| Env | `src/shared/config/env.ts` |
| HTTP | `src/shared/api/http-client.ts` |
| Router | `src/app/router.tsx` |
| Vite / base | `vite.config.ts` |
| Deploy | `.github/workflows/deploy-pages.yml` |
| E2E | `e2e/`, `playwright.config.ts` |
