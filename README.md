# To-Do Frontend

SPA React + TypeScript (Vite) para o board Kanban do **To-Do-Backend**.

## Stack

- Vite + React 19 + TypeScript
- TanStack Query, React Router, Zod, React Hook Form
- Tailwind CSS
- `@dnd-kit` para drag-and-drop de cards
- **Vitest** + React Testing Library + MSW (unitário/integração)
- **Playwright** (regressão E2E)

## Ambientes

| Script | Mode | Backend |
|---|---|---|
| `npm run dev:qa` | `qa` | `https://to-do-backend-c6t5.onrender.com` |
| `npm run dev:development` | `development` | `http://localhost:3334` |
| `npm run dev:e2e` | `e2e` | proxy local `/api` → API QA (usado pelo Playwright) |

Arquivos:

- [`.env.qa`](./.env.qa)
- [`.env.development`](./.env.development)
- [`.env.e2e`](./.env.e2e)

## Setup

```bash
cd To-Do-Frontend
npm install
npm run dev:qa
# ou
npm run dev:development
```

Abra a URL do Vite (geralmente `http://localhost:5173`).

### Development local

Suba o backend em `http://localhost:3334` antes de `npm run dev:development`.

### QA

O backend no Render pode ter cold start na primeira request — a UI mostra loading e permite tentar novamente.

## Testes

### Unitário / integração (Vitest)

```bash
npm run test
npm run test:watch
npm run test:coverage
```

- Ambiente: jsdom
- Rede: MSW (`src/test/handlers.ts`)
- Helpers: `src/test/test-utils.tsx`

### Regressão E2E (Playwright)

```bash
npx playwright install chromium   # primeira vez
npm run test:e2e
npm run test:e2e:ui
```

Sobe `dev:e2e` na porta `5174` com proxy `/api` para a API QA (evita problemas de CORS no browser). Specs em `e2e/`:

- `boards.spec.ts` — criar/renomear/apagar board
- `kanban.spec.ts` — colunas, cards e edição no modal
- `dnd.spec.ts` — arrastar card entre colunas e persistir após reload

## Estrutura

```
src/
  app/        # providers e router
  pages/      # BoardsPage, BoardPage
  entities/   # tipos e schemas Zod
  features/   # boards, lists, cards (+ DnD)
  shared/     # api, ui, config
  test/       # setup Vitest, MSW, fixtures
e2e/          # Playwright
```

## Scripts

- `npm run dev:qa` — frontend apontando para API de QA
- `npm run dev:development` — frontend apontando para API local
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run lint` — oxlint
- `npm run test` — Vitest
- `npm run test:coverage` — Vitest com coverage (meta ≥ 70% lines nas áreas configuradas)
- `npm run test:e2e` — Playwright
