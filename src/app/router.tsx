import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BoardPage } from '@/pages/BoardPage'
import { BoardsPage } from '@/pages/BoardsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BoardsPage />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
