import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import { DETAIL_COLORS, type Note, type Task } from '../data/notes'
import { useNotes } from '../context/NotesContext'

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notes, updateNote } = useNotes()

  const note = notes.find((n) => n.id === id)

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

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fefcf4' }}>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: '#383833' }}>Nota no encontrada</p>
          <button
            onClick={() => navigate('/board')}
            className="mt-4 px-6 py-2 rounded-lg font-semibold"
            style={{ background: '#89f0cb', color: '#00382a' }}
          >
            Volver al tablero
          </button>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen" style={{ background: '#fefcf4', color: '#383833' }}>
      <TopAppBar />

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2">
          <button
            onClick={() => navigate('/board')}
            className="flex items-center gap-2 transition-colors group"
            style={{ color: '#635f5a' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#007257')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#635f5a')}
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="font-medium">Volver al tablero</span>
          </button>
        </div>

        {/* Expanded Note Card */}
        <article
          className="relative p-8 md:p-12 rounded-xl dog-ear"
          style={{ background: dc.bg, boxShadow: '0px 10px 40px rgba(56,56,53,0.08)' }}
        >
          <div className="dog-ear-fold" />

          {/* Note Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined" style={{ color: dc.accent }}>
                  sticky_note_2
                </span>
                <span className="font-medium tracking-widest uppercase text-xs" style={{ color: dc.title }}>
                  Nota Principal
                </span>
              </div>
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

                  {/* Task text — editable on double click */}
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

                  {/* Delete — visible on hover */}
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

              {/* Ghost input — add new task */}
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
            <div className="flex gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold"
                style={{ color: dc.accent }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
              >
                <span className="material-symbols-outlined">share</span>
                <span>Compartir</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold"
                style={{ color: dc.accent }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
              >
                <span className="material-symbols-outlined">delete</span>
                <span>Archivar</span>
              </button>
            </div>
          </footer>
        </article>

      </main>

    </div>
  )
}
