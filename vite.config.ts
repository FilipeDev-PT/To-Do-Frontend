/// <reference types="vitest/config" />
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const QA_API = 'https://to-do-backend-c6t5.onrender.com'

// Repo name on GitHub Pages: https://<user>.github.io/To-Do-Frontend/
const GH_PAGES_BASE = '/To-Do-Frontend/'

export default defineConfig(({ command }) => ({
  // Production build is served under the repo path on GitHub Pages
  base: command === 'build' ? GH_PAGES_BASE : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: QA_API,
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    env: {
      VITE_API_URL: 'http://localhost:3334',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/shared/**/*.{ts,tsx}',
        'src/entities/**/*.{ts,tsx}',
        'src/features/**/lib/**/*.{ts,tsx}',
      ],
      thresholds: {
        lines: 70,
      },
    },
  },
}))

