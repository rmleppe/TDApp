import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotesProvider } from './context/NotesContext'
import { TimerProvider } from './context/TimerContext'

const NotesBoard        = lazy(() => import('./pages/NotesBoard'))
const NoteDetail        = lazy(() => import('./pages/NoteDetail'))
const ArchivePage       = lazy(() => import('./pages/ArchivePage'))
const LoginPage         = lazy(() => import('./pages/LoginPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))

function AuthenticatedRoutes({ uid }: { uid: string }) {
  return (
    <NotesProvider uid={uid}>
      <Routes>
        <Route path="/" element={<Navigate to="/board" replace />} />
        <Route path="/board" element={<NotesBoard />} />
        <Route path="/note/:id" element={<NoteDetail />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="*" element={<Navigate to="/board" replace />} />
      </Routes>
    </NotesProvider>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {!user ? (
          <Route path="*" element={<LoginPage />} />
        ) : (
          <Route path="*" element={<AuthenticatedRoutes uid={user.uid} />} />
        )}
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <AppRoutes />
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
