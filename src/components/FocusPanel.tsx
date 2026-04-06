import { useState, useRef, useEffect } from 'react'
import { useNotes, type FocusTask } from '../context/NotesContext'

function todayDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatYMD(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateLabel(dateStr: string): string {
  if (dateStr === todayDate()) return 'Hoy'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

/* ── Task row ────────────────────────────────────────────────────── */
function TaskRow({
  task,
  editingId,
  editingText,
  editRef,
  readOnly,
  onToggle,
  onStartEdit,
  onCommitEdit,
  onEditingTextChange,
  onCancelEdit,
  onDelete,
}: {
  task: FocusTask
  editingId: string | null
  editingText: string
  editRef: React.RefObject<HTMLInputElement>
  readOnly: boolean
  onToggle: () => void
  onStartEdit: () => void
  onCommitEdit: () => void
  onEditingTextChange: (v: string) => void
  onCancelEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="group flex items-center gap-2 p-2 md:p-2.5 rounded-xl transition-all duration-150"
      style={{
        background: '#ffffff',
        border: '1px solid #e8e5dd',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = task.done ? '#e8e5dd' : '#89f0cb')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = '#e8e5dd')
      }
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150 border-2"
        style={{
          background: task.done ? '#007257' : 'transparent',
          borderColor: task.done ? '#007257' : '#c8c4bc',
        }}
      >
        {task.done && (
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}
          >
            check
          </span>
        )}
      </button>

      {/* Text — editable on double click (only when not readOnly) */}
      <div className="flex-1 min-w-0">
        {editingId === task.id ? (
          <input
            ref={editRef}
            type="text"
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            onBlur={onCommitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitEdit()
              if (e.key === 'Escape') onCancelEdit()
            }}
            className="w-full bg-transparent outline-none text-sm font-medium"
            style={{
              color: '#383833',
              borderBottom: '1.5px solid #007257',
              fontFamily: 'Be Vietnam Pro, sans-serif',
            }}
          />
        ) : (
          <p
            className="font-medium text-sm leading-snug"
            style={{
              color: task.done ? '#7f7b75' : '#383833',
              textDecoration: task.done ? 'line-through' : 'none',
              fontFamily: 'Be Vietnam Pro, sans-serif',
              cursor: readOnly ? 'default' : 'text',
            }}
            onDoubleClick={() => !readOnly && !task.done && onStartEdit()}
          >
            {task.text}
          </p>
        )}
      </div>

      {/* Delete — on hover, hidden in readOnly mode */}
      {!readOnly && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded flex-shrink-0"
          style={{ color: '#c8c4bc' }}
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  )
}

/* ── FocusPanel ──────────────────────────────────────────────────── */
export default function FocusPanel() {
  const {
    focusTasks, addFocusTask, toggleFocusTask, editFocusTask,
    deleteFocusTask, selectedDate, setSelectedDate, firstTaskDate, isToday,
  } = useNotes()
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  const total = focusTasks.length
  const doneCount = focusTasks.filter((t) => t.done).length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  const canGoBack = true
  const canGoForward = selectedDate < todayDate()

  const goBack = () => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    setSelectedDate(formatYMD(new Date(y, m - 1, d - 1)))
  }

  const goForward = () => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    setSelectedDate(formatYMD(new Date(y, m - 1, d + 1)))
  }

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editingId])

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    addFocusTask(text)
    setInput('')
    inputRef.current?.focus()
  }

  const commitEdit = () => {
    if (!editingId) return
    const text = editingText.trim()
    if (text) editFocusTask(editingId, text)
    setEditingId(null)
  }

  return (
    <div
      className="sticky top-24 rounded-2xl p-3 md:p-4 flex flex-col gap-2 md:gap-3"
      style={{
        background: '#f2efe6',
        border: '1px solid #e8e5dd',
        boxShadow: '0px 4px 24px rgba(56,56,51,0.07)',
      }}
    >
      {/* Header with date navigation */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="p-1 rounded-lg transition-all duration-150 active:scale-75 hover:-translate-x-0.5 cursor-pointer"
          style={{ color: canGoBack ? '#007257' : '#c8c4bc' }}
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        <h2
          className="font-bold text-xl md:text-xl flex items-center gap-2"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#383833' }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#007257' }}>
            rocket
          </span>
          {formatDateLabel(selectedDate)}
        </h2>

        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="p-1 rounded-lg transition-all duration-150 active:scale-75 hover:translate-x-0.5 cursor-pointer"
          style={{ color: canGoForward ? '#007257' : '#c8c4bc' }}
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-1">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <span className="text-xs font-semibold" style={{ color: '#7f7b75', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              {doneCount} Completada{doneCount !== 1 ? 's' : ''}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(0,114,87,0.1)', color: '#007257', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {pct}% LISTO
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e8e5dd' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: '#007257' }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {focusTasks.length === 0 && !isToday && (
          <p
            className="text-sm text-center py-3"
            style={{ color: '#7f7b75', fontFamily: 'Be Vietnam Pro, sans-serif' }}
          >
            Sin tareas este día
          </p>
        )}
        {focusTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            editingId={editingId}
            editingText={editingText}
            editRef={editRef as React.RefObject<HTMLInputElement>}
            readOnly={!isToday}
            onToggle={() => toggleFocusTask(task.id)}
            onStartEdit={() => { setEditingId(task.id); setEditingText(task.text) }}
            onCommitEdit={commitEdit}
            onEditingTextChange={setEditingText}
            onCancelEdit={() => setEditingId(null)}
            onDelete={() => deleteFocusTask(task.id)}
          />
        ))}
      </div>

      {/* Add input — only shown on today */}
      {isToday && (
        <div
          className="flex items-center gap-2 pt-3 mt-1"
          style={{ borderTop: '1px solid #e8e5dd' }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ color: '#c8c4bc' }}>
            add
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Añadir tarea de enfoque..."
            className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-[#c8c4bc]"
            style={{ color: '#383833', fontFamily: 'Be Vietnam Pro, sans-serif' }}
            onFocus={(e) => {
              const icon = e.currentTarget.previousElementSibling as HTMLElement
              if (icon) icon.style.color = '#007257'
            }}
            onBlur={(e) => {
              const icon = e.currentTarget.previousElementSibling as HTMLElement
              if (icon) icon.style.color = '#c8c4bc'
            }}
          />
        </div>
      )}
    </div>
  )
}
