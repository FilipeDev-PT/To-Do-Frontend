import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BoardPage } from '@/pages/BoardPage'
import { BoardsPage } from '@/pages/BoardsPage'

/** Vite BASE_URL ends with `/`; React Router basename must not. */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export function AppRouter() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<BoardsPage />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
