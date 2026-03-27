import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { NOTES, type Note } from '../data/notes'

export interface FocusTask {
  id: string
  text: string
  done: boolean
}

const INITIAL_FOCUS_TASKS: FocusTask[] = [
  { id: 'f1', text: 'Revisar componentes de UI para el lanzamiento', done: false },
  { id: 'f2', text: 'Coordinar con el equipo de marketing', done: false },
  { id: 'f3', text: 'Standup matutino', done: true },
]

interface NotesContextValue {
  notes: Note[]
  addNote: (note: Note) => void
  updateNote: (updated: Note) => void
  reorderNotes: (fromIndex: number, toIndex: number) => void
  focusTasks: FocusTask[]
  addFocusTask: (text: string) => void
  toggleFocusTask: (id: string) => void
  editFocusTask: (id: string, text: string) => void
  reorderFocusTasks: (fromIndex: number, toIndex: number) => void
  deleteFocusTask: (id: string) => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(() =>
    JSON.parse(localStorage.getItem('notes') ?? 'null') ?? NOTES
  )
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>(() =>
    JSON.parse(localStorage.getItem('focusTasks') ?? 'null') ?? INITIAL_FOCUS_TASKS
  )

  useEffect(() => { localStorage.setItem('notes', JSON.stringify(notes)) }, [notes])
  useEffect(() => { localStorage.setItem('focusTasks', JSON.stringify(focusTasks)) }, [focusTasks])

  const addNote = (note: Note) => setNotes((prev) => [...prev, note])

  const updateNote = (updated: Note) =>
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))

  const reorderNotes = (fromIndex: number, toIndex: number) => {
    setNotes((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const addFocusTask = (text: string) =>
    setFocusTasks((prev) => [...prev, { id: `f${Date.now()}`, text, done: false }])

  const toggleFocusTask = (id: string) =>
    setFocusTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, done: !t.done } : t)
    )

  const editFocusTask = (id: string, text: string) =>
    setFocusTasks((prev) => prev.map((t) => t.id === id ? { ...t, text } : t))

  const reorderFocusTasks = (fromIndex: number, toIndex: number) => {
    setFocusTasks((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const deleteFocusTask = (id: string) =>
    setFocusTasks((prev) => prev.filter((t) => t.id !== id))

  return (
    <NotesContext.Provider value={{
      notes, addNote, updateNote, reorderNotes,
      focusTasks, addFocusTask, toggleFocusTask, editFocusTask, reorderFocusTasks, deleteFocusTask,
    }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used inside NotesProvider')
  return ctx
}
