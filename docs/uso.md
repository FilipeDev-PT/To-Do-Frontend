# Documentação de uso — To-Do Frontend

Guia para instalar, rodar, usar a UI Kanban e publicar no GitHub Pages.

## Visão geral

SPA React que consome o **To-Do-Backend** (boards → lists → cards).

| Item | Valor |
|---|---|
| Stack | Vite, React 19, TypeScript, TanStack Query, React Router, Zod, RHF, Tailwind, `@dnd-kit` |
| Produção | [https://filipedev-pt.github.io/To-Do-Frontend/](https://filipedev-pt.github.io/To-Do-Frontend/) |
| API QA | `https://to-do-backend-c6t5.onrender.com` |

## Pré-requisitos

- Node.js 20+ (recomendado 22)
- Backend local **ou** uso da API de QA no Render

## Instalação

```bash
cd To-Do-Frontend
npm install
```

Variáveis vêm dos arquivos `.env.<mode>` — não é necessário copiar `.env` manualmente para o dia a dia.

## Ambientes

| Script | Mode | Backend |
|---|---|---|
| `npm run dev:qa` | `qa` | Render QA |
| `npm run dev:development` | `development` | `http://localhost:3334` |
| `npm run dev:e2e` | `e2e` | Proxy `/api` → Render (Playwright) |
| `npm run build` | `production` | Render QA (`.env.production`) |

Arquivos: `.env.qa`, `.env.development`, `.env.e2e`, `.env.production` (modelo em `.env.example`).

Variável obrigatória: `VITE_API_URL`.

## Subir o frontend

### Contra API de QA (mais simples)

```bash
npm run dev:qa
```

Abra a URL do Vite (geralmente `http://localhost:5173`).

> A API no Render pode ter **cold start** na primeira chamada. A UI mostra loading e permite tentar novamente.

### Contra backend local

1. No backend: `npm run db:create` e `npm run dev` (porta `3334`)
2. No frontend:

```bash
npm run dev:development
```

## Como usar a aplicação

### Lista de boards (`/`)

1. Abra a home — vê o grid de boards (ou empty state).
2. **Novo board** — modal com título → cria e aparece na lista.
3. Clique no board para abrir o Kanban.
4. No card do board: **renomear** (modal) ou **apagar** (confirmação do browser).

### Board Kanban (`/boards/:boardId`)

1. Título do board editável no topo; link para voltar à lista.
2. **Nova coluna** — cria uma list no final.
3. Clique no título da coluna para renomear; use a ação de apagar (confirmação).
4. **Adicionar card** no rodapé da coluna.
5. Clique no card → **modal**: editar título/descrição ou apagar.
6. **Arraste** cards entre colunas (ou reordene na mesma coluna). A posição é persistida na API; a UI atualiza de forma otimista.

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev:qa` | Dev apontando para API QA |
| `npm run dev:development` | Dev apontando para API local |
| `npm run build` | Build de produção (`base` GitHub Pages) |
| `npm run preview` | Preview do `dist` |
| `npm run lint` | oxlint |
| `npm run test` | Vitest |
| `npm run test:watch` | Vitest watch |
| `npm run test:coverage` | Coverage (≥ 70% lines nas áreas configuradas) |
| `npm run test:e2e` | Playwright |
| `npm run test:e2e:ui` | Playwright UI |

`postbuild` copia `dist/index.html` → `dist/404.html` (deep links no GitHub Pages).

## Testes

### Unitário / integração

```bash
npm run test
```

- jsdom + MSW (`src/test/handlers.ts`)
- Helpers: `src/test/test-utils.tsx`

### E2E

```bash
npx playwright install chromium   # primeira vez
npm run test:e2e
```

Sobe `dev:e2e` em `http://127.0.0.1:5174` com proxy `/api` → Render (evita CORS no browser). Specs:

| Spec | Cobertura |
|---|---|
| `e2e/boards.spec.ts` | Criar / renomear / apagar board |
| `e2e/kanban.spec.ts` | Colunas, cards, modal |
| `e2e/dnd.spec.ts` | Drag entre colunas + persistência após reload |

## Deploy (GitHub Pages)

URL: https://filipedev-pt.github.io/To-Do-Frontend/

1. Push em `main` (ou `workflow_dispatch`) dispara [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml).
2. Configuração única no GitHub: **Settings → Pages → Source: GitHub Actions**.

O build usa:

- `base: /To-Do-Frontend/`
- `BrowserRouter` com `basename`
- `404.html` igual ao `index.html` para rotas da SPA

## Troubleshooting

| Sintoma | O que verificar |
|---|---|
| Erro ao iniciar: `VITE_API_URL is not defined` | Use `dev:qa` / `dev:development` (não `vite` puro sem mode) |
| Falha ao falar com API local | Backend em `3334` + `dev:development` |
| Loading longo na QA | Cold start do Render; retry na UI ou `GET /healthz` |
| 404 ao abrir `/boards/...` no Pages | Confirmar deploy com `404.html` e Pages via Actions |
| Assets 404 no Pages | Confirmar `base` `/To-Do-Frontend/` alinhado ao nome do repo |

Documentação técnica: [`tecnica.md`](./tecnica.md).
