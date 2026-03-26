import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NotesProvider } from './context/NotesContext'
import { TimerProvider } from './context/TimerContext'
import NotesBoard from './pages/NotesBoard'
import NoteDetail from './pages/NoteDetail'

export default function App() {
  return (
    <TimerProvider>
    <NotesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<NotesBoard />} />
          <Route path="/note/:id" element={<NoteDetail />} />
        </Routes>
      </BrowserRouter>
    </NotesProvider>
    </TimerProvider>
  )
}
