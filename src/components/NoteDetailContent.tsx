import { useState, useRef, useEffect } from 'react'
import { DETAIL_COLORS, type Note, type Task } from '../data/notes'
import { useNotes } from '../context/NotesContext'

export default function NoteDetailContent({
  note,
  onClose,
}: {
  note: Note
  onClose: () => void
}) {
  const { updateNote, deleteNote, archiveNote } = useNotes()
  const [confirming, setConfirming] = useState<'delete' | 'archive' | null>(null)

  const [newTask, setNewTask] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingTaskId])

  const tasks = note.tasks ?? []
  const doneCount = tasks.filter((t) => t.done).length
  const dc = DETAIL_COLORS[note.color]

  const patchNote = (patch: Partial<Note>) =>
    updateNote({ ...note, ...patch, editedAt: 'Ahora mismo' })

  const toggleTask = (taskId: string) => {
    patchNote({
      tasks: tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    })
  }

  const addTask = () => {
    const text = newTask.trim()
    if (!text) return
    patchNote({
      tasks: [...tasks, { id: `t${Date.now()}`, text, done: false }],
    })
    setNewTask('')
  }

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingText(task.text)
  }

  const commitEdit = () => {
    if (!editingTaskId) return
    const text = editingText.trim()
    if (text) {
      patchNote({
        tasks: tasks.map((t) => (t.id === editingTaskId ? { ...t, text } : t)),
      })
    }
    setEditingTaskId(null)
  }

  const deleteTask = (taskId: string) => {
    patchNote({ tasks: tasks.filter((t) => t.id !== taskId) })
  }

  return (
    <article
      className="relative p-8 md:p-12 rounded-xl dog-ear"
      style={{ background: dc.bg, boxShadow: '0px 10px 40px rgba(56,56,53,0.08)' }}
    >
      <div className="dog-ear-fold" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 p-1.5 rounded-lg transition-colors cursor-pointer"
        style={{ color: dc.accent }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.07)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
        title="Cerrar"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>

      {/* Note Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <input
            type="text"
            defaultValue={note.title}
            onBlur={(e) => {
              const val = e.target.value.trim()
              if (val && val !== note.title) patchNote({ title: val })
              else e.target.value = note.title
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              if (e.key === 'Escape') {
                ;(e.target as HTMLInputElement).value = note.title
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight bg-transparent outline-none w-full"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: dc.title,
              borderBottom: '2px solid transparent',
            }}
            onFocus={(e) => (e.target.style.borderBottomColor = dc.accent)}
            onBlurCapture={(e) => (e.target.style.borderBottomColor = 'transparent')}
          />
          {tasks.length > 0 && (
            <p className="mt-2 text-sm font-medium" style={{ color: dc.accent }}>
              {doneCount} de {tasks.length} tareas completadas
            </p>
          )}
        </div>
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: tag === 'Priority' ? '#a7c6f0' : '#deffaf',
                  color: tag === 'Priority' ? '#143658' : '#4a6425',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Tasks Section */}
      {note.type === 'tasks' && (
        <section className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 group">
              {/* Checkbox */}
              <div
                className="h-6 w-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: task.done ? dc.checkDone : dc.checkBorder,
                  background: task.done ? dc.checkDone : 'transparent',
                }}
                onClick={() => toggleTask(task.id)}
              >
                {task.done && (
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                )}
              </div>

              {/* Task text */}
              {editingTaskId === task.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit()
                    if (e.key === 'Escape') setEditingTaskId(null)
                  }}
                  className="flex-1 bg-transparent outline-none text-xl font-medium py-0.5 px-1 rounded"
                  style={{
                    color: dc.title,
                    borderBottom: `2px solid ${dc.accent}`,
                    fontFamily: 'Be Vietnam Pro, sans-serif',
                  }}
                />
              ) : (
                <span
                  className="flex-1 text-xl font-medium transition-colors duration-200 cursor-text"
                  style={{
                    color: task.done ? dc.primary : dc.title,
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}
                  onDoubleClick={() => !task.done && startEdit(task)}
                >
                  {task.text}
                </span>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg"
                style={{ color: dc.primary }}
                title="Eliminar tarea"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}

          {/* Add new task */}
          <div
            className="mt-8 pt-6 flex items-center gap-4"
            style={{ borderTop: `1px solid ${dc.border}` }}
          >
            <span className="material-symbols-outlined" style={{ color: dc.accent }}>add</span>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Añadir nueva tarea..."
              className="bg-transparent w-full py-2 px-0 text-xl font-medium outline-none placeholder:opacity-40"
              style={{
                borderBottom: `2px solid ${dc.border}`,
                color: dc.title,
                fontFamily: 'Be Vietnam Pro, sans-serif',
              }}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderBottomColor = dc.accent)}
              onBlur={(e) => {
                addTask()
                ;(e.target as HTMLInputElement).style.borderBottomColor = dc.border
              }}
            />
          </div>
        </section>
      )}

      {/* Text content */}
      {note.type === 'text' && (
        <textarea
          value={note.content ?? ''}
          onChange={(e) => patchNote({ content: e.target.value })}
          placeholder="Escribe algo..."
          rows={8}
          className="w-full bg-transparent outline-none text-xl leading-relaxed font-medium resize-none placeholder:opacity-40"
          style={{
            color: dc.title,
            fontFamily: 'Be Vietnam Pro, sans-serif',
            borderBottom: `1px solid ${dc.border}`,
          }}
        />
      )}

      {/* Footer */}
      <footer
        className="mt-16 flex flex-wrap items-center justify-between gap-6 pt-8"
        style={{ borderTop: `1px solid ${dc.border}` }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold" style={{ color: dc.accent }}>
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            <span className="text-sm">Creado {note.createdAt}</span>
          </div>
          <div className="flex items-center gap-2 italic" style={{ color: dc.accent, opacity: 0.7 }}>
            <span className="material-symbols-outlined text-lg">schedule</span>
            <span className="text-sm">Editado {note.editedAt}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: dc.accent, fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                {confirming === 'delete' ? '¿Eliminar nota?' : '¿Archivar nota?'}
              </span>
              <button
                onClick={() => {
                  if (confirming === 'delete') { deleteNote(note.id); onClose() }
                  else { archiveNote(note.id); onClose() }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer"
                style={{ background: confirming === 'delete' ? '#c0392b' : dc.accent, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirming(null)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.08)', color: dc.accent, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirming('archive')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold cursor-pointer"
                style={{ color: dc.accent }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
              >
                <span className="material-symbols-outlined">archive</span>
                <span>Archivar</span>
              </button>
              <button
                onClick={() => setConfirming('delete')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold cursor-pointer"
                style={{ color: '#c0392b' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,57,43,0.08)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
              >
                <span className="material-symbols-outlined">delete</span>
                <span>Eliminar</span>
              </button>
            </>
          )}
        </div>
      </footer>
    </article>
  )
}
