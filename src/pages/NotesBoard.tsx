import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTimer } from '../context/TimerContext'
import FocusPanel from '../components/FocusPanel'
import NoteDetailContent from '../components/NoteDetailContent'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TopAppBar from '../components/TopAppBar'
import { COLOR_MAP, type Note } from '../data/notes'
import { useNotes } from '../context/NotesContext'

/* ── Color picker options ─────────────────────────────────────────── */
const COLOR_OPTIONS: Array<{ value: Note['color']; hex: string; label: string }> = [
  { value: 'amber',    hex: '#ffd98e', label: 'Ámbar'    },
  { value: 'green',    hex: '#e8ffcc', label: 'Verde'    },
  { value: 'blue',     hex: '#cce0ff', label: 'Azul'     },
  { value: 'gray',     hex: '#eae8e2', label: 'Gris'     },
  { value: 'rose',     hex: '#ffd6e0', label: 'Rosa'     },
  { value: 'lavender', hex: '#e6e0ff', label: 'Lavanda'  },
  { value: 'peach',    hex: '#ffe4cc', label: 'Durazno'  },
  { value: 'mint',     hex: '#ccf5ee', label: 'Menta'    },
]

/* ── Create Note Modal ────────────────────────────────────────────── */
const ICON_OPTIONS = [
  'check_circle', 'sticky_note_2', 'star', 'bookmark',
  'bolt', 'favorite', 'flag', 'rocket',
  'work', 'school', 'fitness_center', 'shopping_cart',
  'lightbulb', 'travel_explore', 'code', 'music_note',
]

function CreateNoteModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (note: Note) => void
}) {
  const [title, setTitle] = useState('')
  const [color, setColor] = useState<Note['color']>('amber')
  const [icon, setIcon]   = useState('check_circle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      icon,
      color,
      blocks: [{ id: `b${Date.now()}`, kind: 'text' as const, content: '' }],
      createdAt: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }),
      editedAt: 'Ahora mismo',
    }
    onCreate(newNote)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(56,56,53,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl p-4 md:p-6 shadow-2xl" style={{ background: '#fefcf4' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#383833' }}>
            Nueva nota
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: '#635f5a' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#635f5a' }}>
              Título
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la nota..."
              className="w-full px-4 py-3 rounded-xl outline-none text-base font-medium"
              style={{ background: '#f5f2ea', color: '#383833', border: '2px solid transparent', fontFamily: 'Be Vietnam Pro, sans-serif' }}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = '#007257')}
              onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = 'transparent')}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold mb-3"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#635f5a' }}>
              Color
            </label>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setColor(opt.value)}
                  className="w-10 h-10 rounded-full transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    background: opt.hex,
                    outline: color === opt.value ? '3px solid #007257' : '3px solid transparent',
                    outlineOffset: '2px',
                  }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-semibold mb-3"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#635f5a' }}>
              Ícono
            </label>
            <div className="grid grid-cols-8 gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    background: icon === ic ? '#89f0cb' : '#f0ede5',
                    color: icon === ic ? '#00382a' : '#635f5a',
                    outline: icon === ic ? '2px solid #007257' : '2px solid transparent',
                    outlineOffset: '1px',
                  }}
                  title={ic}
                >
                  <span className="material-symbols-outlined text-[18px]">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold cursor-pointer"
              style={{ background: '#eeece4', color: '#635f5a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Cancelar
            </button>
            <button type="submit" disabled={!title.trim()}
              className="flex-1 py-3 rounded-xl font-semibold transition-opacity cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: '#007257', color: '#ffffff',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                opacity: title.trim() ? 1 : 0.4,
              }}>
              Crear nota
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


/* ── Note card content (shared between sortable & overlay) ───────── */
function NoteCardContent({ note, faded = false }: { note: Note; faded?: boolean }) {
  const c = COLOR_MAP[note.color]
  return (
    <div
      className={`relative ${c.bg} p-4 md:p-5 rounded-xl dog-ear flex flex-col gap-4 min-h-[90px] md:min-h-[120px] h-full`}
      style={{ opacity: faded ? 0 : 1 }}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-bold ${c.title} text-sm md:text-base`}
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {note.title}
        </h3>
        <span className={`material-symbols-outlined ${c.icon}`} style={{ fontSize: '22px' }}>
          {note.icon}
        </span>
      </div>


      {note.tags && note.tags.length > 0 && (
        <div className="mt-auto flex gap-2 flex-wrap">
          {note.tags.map((tag) => (
            <span key={tag}
              className={`${c.text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}
              style={{ background: 'rgba(0,0,0,0.08)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="dog-ear-fold" />
    </div>
  )
}

/* ── Sortable note card ───────────────────────────────────────────── */
function SortableNoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition: transform ? transition : undefined }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="cursor-grab active:cursor-grabbing"
    >
      <NoteCardContent note={note} faded={isDragging} />
    </div>
  )
}

/* ── Board ────────────────────────────────────────────────────────── */
export default function NotesBoard() {
  const { notes: allNotes, loading, addNote, reorderNotes } = useNotes()
  const notes = allNotes.filter((n) => !n.archived)
  const { user } = useAuth()
  const { focusMode } = useTimer()
  const firstName = user?.displayName?.split(' ')[0] ?? ''
  const [showCreate, setShowCreate] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } })
  )

  const activeNote = activeId ? notes.find((n) => n.id === activeId) : null

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const from = allNotes.findIndex((n) => n.id === active.id)
      const to   = allNotes.findIndex((n) => n.id === over.id)
      reorderNotes(from, to)
    }
    setActiveId(null)
  }

  const handleCreate = (note: Note) => {
    addNote(note)
    setShowCreate(false)
    setSelectedNoteId(note.id)
  }

  const selectedNote = selectedNoteId ? notes.find((n) => n.id === selectedNoteId) : null

  return (
    <div className="min-h-screen" style={{ background: '#fefcf4', color: '#383833' }}>
      {showCreate && (
        <CreateNoteModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}

      {/* Focus mode overlay */}
      {focusMode && (
        <div
          className="fixed inset-0 z-[55] transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
        />
      )}

      <TopAppBar />

      <main className="max-w-screen-2xl mx-auto px-4 py-4 pb-20 md:px-6 md:py-6 md:pb-28">
        <header className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#383833' }}>
            Buen día, {firstName}
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start">
          {/* Left: Focus Panel */}
          <div
            className="w-full lg:w-[560px] flex-shrink-0"
            style={{ position: 'relative', zIndex: focusMode ? 60 : undefined }}
          >
            <FocusPanel />
          </div>

          {/* Right: Notes grid */}
          <div className="w-full flex-1 min-w-0">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl min-h-[90px] md:min-h-[120px] animate-pulse"
                style={{ background: '#eae8e2' }}
              />
            ))}
          </div>
        ) : null}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: loading ? 'none' : undefined }}>
          <SortableContext items={notes.map((n) => n.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              {notes.map((note) => (
                <SortableNoteCard
                  key={note.id}
                  note={note}
                  onClick={() => !activeId && setSelectedNoteId(note.id)}
                />
              ))}

              {/* Create New Note */}
              <button
                onClick={() => setShowCreate(true)}
                className="group relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 min-h-[90px] md:min-h-[120px] transition-colors duration-200 active:scale-[0.98] cursor-pointer"
                style={{ borderColor: '#c8c4bc', background: '#faf8f0' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#eeece4')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#faf8f0')}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: '#ffc650' }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: '#5c4100' }}>add</span>
                </div>
                <span className="font-bold"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#635f5a' }}>
                  Crear nueva nota
                </span>
              </button>
            </div>
          </SortableContext>

          {/* Drag overlay — the "lifted" card */}
          <DragOverlay dropAnimation={null}>
            {activeNote && (
              <div style={{
                transform: 'rotate(2deg)',
                boxShadow: '0px 20px 60px rgba(56,56,53,0.25)',
                borderRadius: '12px',
                cursor: 'grabbing',
              }}>
                <NoteCardContent note={activeNote} />
              </div>
            )}
          </DragOverlay>
          </div>{/* end loading wrapper */}
        </DndContext>
          </div>{/* end right column */}
        </div>{/* end two-col flex */}
      </main>

      {/* FAB */}
      {!selectedNote && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-5 right-5 w-12 h-12 md:bottom-6 md:right-6 md:w-14 md:h-14 rounded-xl shadow-2xl flex items-center justify-center z-[60] transition-transform duration-200 active:scale-90"
          style={{ background: '#007257', color: '#ffffff' }}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto py-16 px-4"
          style={{ background: 'rgba(56,56,53,0.35)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && setSelectedNoteId(null)}
        >
          <div className="w-full max-w-3xl">
            <NoteDetailContent note={selectedNote} onClose={() => setSelectedNoteId(null)} />
          </div>
        </div>
      )}

    </div>
  )
}
