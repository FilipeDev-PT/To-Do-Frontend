# To-Do Frontend

SPA React + TypeScript (Vite) para o board Kanban do **To-Do-Backend**.

## Documentação

| Doc | Conteúdo |
|---|---|
| [`docs/uso.md`](./docs/uso.md) | Instalação, ambientes, uso da UI, testes, deploy, troubleshooting |
| [`docs/tecnica.md`](./docs/tecnica.md) | Arquitetura, dados, rotas, DnD, Vitest/Playwright, Pages |

## Stack

- Vite + React 19 + TypeScript
- TanStack Query, React Router, Zod, React Hook Form
- Tailwind CSS
- `@dnd-kit` para drag-and-drop de cards
- **Vitest** + React Testing Library + MSW
- **Playwright** (E2E)

## Setup rápido

```bash
cd To-Do-Frontend
npm install
npm run dev:qa                 # API Render
# ou
npm run dev:development        # API local :3334
```

Produção: [https://filipedev-pt.github.io/To-Do-Frontend/](https://filipedev-pt.github.io/To-Do-Frontend/)

## Ambientes

| Script | Mode | Backend |
|---|---|---|
| `npm run dev:qa` | `qa` | Render QA |
| `npm run dev:development` | `development` | `http://localhost:3334` |
| `npm run dev:e2e` | `e2e` | proxy `/api` → Render |
| `npm run build` | `production` | Render QA (`.env.production`) |

## Scripts

| Script | Descrição |
|---|---|
| `npm run build` / `preview` | Build e preview |
| `npm run test` / `test:coverage` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run lint` | oxlint |

Detalhes de uso e deploy: [`docs/uso.md`](./docs/uso.md).
