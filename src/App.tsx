import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotesProvider } from './context/NotesContext'
import { TimerProvider } from './context/TimerContext'

const NotesBoard  = lazy(() => import('./pages/NotesBoard'))
const NoteDetail  = lazy(() => import('./pages/NoteDetail'))
const ArchivePage = lazy(() => import('./pages/ArchivePage'))
const LoginPage   = lazy(() => import('./pages/LoginPage'))

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  )

  return (
    <NotesProvider uid={user.uid}>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Navigate to="/board" replace />} />
            <Route path="/board" element={<NotesBoard />} />
            <Route path="/note/:id" element={<NoteDetail />} />
            <Route path="/archive" element={<ArchivePage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </NotesProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <AppRoutes />
      </TimerProvider>
    </AuthProvider>
  )
}
