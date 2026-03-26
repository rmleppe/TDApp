import { useState, useRef, useEffect } from 'react'
import { useNotes } from '../context/NotesContext'

export default function FocusPanel() {
  const { focusTasks, addFocusTask, toggleFocusTask, editFocusTask, deleteFocusTask } = useNotes()
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  const pending = focusTasks.filter((t) => !t.done).length

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

  const startEdit = (id: string, text: string) => {
    setEditingId(id)
    setEditingText(text)
  }

  const commitEdit = () => {
    if (!editingId) return
    const text = editingText.trim()
    if (text) editFocusTask(editingId, text)
    setEditingId(null)
  }

  return (
    <div
      className="sticky top-24 rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: '#f2efe6',
        border: '1px solid #e8e5dd',
        boxShadow: '0px 4px 24px rgba(56,56,51,0.07)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2
          className="font-bold text-lg flex items-center gap-2"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#383833' }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#007257' }}>
            rocket
          </span>
          Today's Focus
        </h2>
        {pending > 0 && (
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(0,114,87,0.1)',
              color: '#007257',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            {pending} {pending === 1 ? 'TAREA' : 'TAREAS'}
          </span>
        )}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {focusTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-150"
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
              onClick={() => toggleFocusTask(task.id)}
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

            {/* Text — editable on double click */}
            <div className="flex-1 min-w-0">
              {editingId === task.id ? (
                <input
                  ref={editRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit()
                    if (e.key === 'Escape') setEditingId(null)
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
                  className="font-medium text-sm leading-snug cursor-text"
                  style={{
                    color: task.done ? '#7f7b75' : '#383833',
                    textDecoration: task.done ? 'line-through' : 'none',
                    fontFamily: 'Be Vietnam Pro, sans-serif',
                  }}
                  onDoubleClick={() => !task.done && startEdit(task.id, task.text)}
                >
                  {task.text}
                </p>
              )}
            </div>

            {/* Delete — on hover */}
            <button
              onClick={() => deleteFocusTask(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded flex-shrink-0"
              style={{ color: '#c8c4bc' }}
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add input */}
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
    </div>
  )
}
