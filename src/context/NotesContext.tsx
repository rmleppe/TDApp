import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { type Note } from '../data/notes'

// Firestore rejects undefined values — strip them before writing
function clean<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T
}

export interface FocusTask {
  id: string
  text: string
  done: boolean
  order: number
}

interface NotesContextValue {
  notes: Note[]
  loading: boolean
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

export function NotesProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([])
  const [notesReady, setNotesReady] = useState(false)
  const [tasksReady, setTasksReady] = useState(false)
  const loading = !notesReady || !tasksReady

  // Real-time listener — notes ordered by `order` field
  useEffect(() => {
    const q = query(collection(db, 'users', uid, 'notes'), orderBy('order'))
    return onSnapshot(q, (snap) => {
      setNotes(snap.docs.map((d) => d.data() as Note))
      setNotesReady(true)
    })
  }, [uid])

  // Real-time listener — focusTasks ordered by `order` field
  useEffect(() => {
    const q = query(collection(db, 'users', uid, 'focusTasks'), orderBy('order'))
    return onSnapshot(q, (snap) => {
      setFocusTasks(snap.docs.map((d) => d.data() as FocusTask))
      setTasksReady(true)
    })
  }, [uid])

  /* ── Notes actions ─────────────────────────────────────────────── */

  const addNote = (note: Note) => {
    const ref = doc(db, 'users', uid, 'notes', note.id)
    setDoc(ref, clean({ ...note, order: notes.length }))
  }

  const updateNote = (updated: Note) => {
    const ref = doc(db, 'users', uid, 'notes', updated.id)
    setDoc(ref, clean(updated), { merge: true })
  }

  const reorderNotes = (fromIndex: number, toIndex: number) => {
    const reordered = [...notes]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    const batch = writeBatch(db)
    reordered.forEach((n, i) => {
      batch.update(doc(db, 'users', uid, 'notes', n.id), { order: i })
    })
    batch.commit()
  }

  /* ── FocusTask actions ─────────────────────────────────────────── */

  const addFocusTask = (text: string) => {
    const id = `f${Date.now()}`
    const ref = doc(db, 'users', uid, 'focusTasks', id)
    setDoc(ref, { id, text, done: false, order: focusTasks.length })
  }

  const toggleFocusTask = (id: string) => {
    const task = focusTasks.find((t) => t.id === id)
    if (!task) return
    updateDoc(doc(db, 'users', uid, 'focusTasks', id), { done: !task.done })
  }

  const editFocusTask = (id: string, text: string) => {
    updateDoc(doc(db, 'users', uid, 'focusTasks', id), { text })
  }

  const reorderFocusTasks = (fromIndex: number, toIndex: number) => {
    const reordered = [...focusTasks]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    const batch = writeBatch(db)
    reordered.forEach((t, i) => {
      batch.update(doc(db, 'users', uid, 'focusTasks', t.id), { order: i })
    })
    batch.commit()
  }

  const deleteFocusTask = (id: string) => {
    deleteDoc(doc(db, 'users', uid, 'focusTasks', id))
  }

  return (
    <NotesContext.Provider value={{
      notes, loading, addNote, updateNote, reorderNotes,
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
