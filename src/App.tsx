import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotesProvider } from './context/NotesContext'
import { TimerProvider } from './context/TimerContext'
import NotesBoard from './pages/NotesBoard'
import NoteDetail from './pages/NoteDetail'
import ArchivePage from './pages/ArchivePage'
import LoginPage from './pages/LoginPage'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <LoginPage />

  return (
    <NotesProvider uid={user.uid}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<NotesBoard />} />
          <Route path="/note/:id" element={<NoteDetail />} />
          <Route path="/archive" element={<ArchivePage />} />
        </Routes>
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
