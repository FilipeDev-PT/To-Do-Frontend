const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl || typeof apiUrl !== 'string') {
  throw new Error('VITE_API_URL is not defined. Use npm run dev:qa or npm run dev:development.')
}

export const env = {
  apiUrl: apiUrl.replace(/\/$/, ''),
} as const
