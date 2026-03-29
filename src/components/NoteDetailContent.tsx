import { useState, useRef, useEffect } from 'react'
import { DETAIL_COLORS, type Note, type NoteBlock } from '../data/notes'
import { useNotes } from '../context/NotesContext'

function initBlocks(note: Note): NoteBlock[] {
  let result: NoteBlock[] = []
  if (note.blocks && note.blocks.length > 0) {
    result = note.blocks
  } else {
    // Migrate from legacy fields
    if (note.content) result.push({ id: 'leg-top', kind: 'text', content: note.content })
    for (const t of note.tasks ?? []) {
      result.push({ id: t.id, kind: 'task', text: t.text, done: t.done })
    }
    if (note.contentBottom) result.push({ id: 'leg-bot', kind: 'text', content: note.contentBottom })
  }
  // Always ensure there's a trailing text block so you can write after tasks
  if (result.length === 0 || result[result.length - 1].kind !== 'text') {
    result = [...result, { id: `b${Date.now()}`, kind: 'text', content: '' }]
  }
  return result
}

export default function NoteDetailContent({
  note,
  onClose,
}: {
  note: Note
  onClose: () => void
}) {
  const { updateNote, deleteNote, archiveNote } = useNotes()
  const [confirming, setConfirming] = useState<'delete' | 'archive' | null>(null)
  const [blocks, setBlocks] = useState<NoteBlock[]>(() => initBlocks(note))
  const [focusId, setFocusId] = useState<string | null>(null)
  const elRefs = useRef<Map<string, HTMLElement>>(new Map())
  const dc = DETAIL_COLORS[note.color]

  const patchNote = (patch: Partial<Note>) =>
    updateNote({ ...note, ...patch, editedAt: 'Ahora mismo' })

  // Save latest blocks using functional update (safe for onBlur)
  const flushBlocks = () => {
    setBlocks((prev) => {
      patchNote({ blocks: prev })
      return prev
    })
  }

  const updateBlockLocal = (id: string, patch: Partial<NoteBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } as NoteBlock : b)))

  const toggleTask = (id: string) => {
    setBlocks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, done: !(b as Extract<NoteBlock, { kind: 'task' }>).done } as NoteBlock : b))
      patchNote({ blocks: next })
      return next
    })
  }

  const deleteBlockAndFocusPrev = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id)
    const prevId = idx > 0 ? blocks[idx - 1].id : null
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id)
      const result = next.length === 0 ? [{ id: `b${Date.now()}`, kind: 'text' as const, content: '' }] : next
      patchNote({ blocks: result })
      return result
    })
    if (prevId) setFocusId(prevId)
  }

  // Auto-focus blocks and position cursor at end
  useEffect(() => {
    if (!focusId) return
    const el = elRefs.current.get(focusId)
    if (el) {
      el.focus()
      if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
        el.setSelectionRange(el.value.length, el.value.length)
      }
      setFocusId(null)
    }
  }, [focusId, blocks])

  const addTask = () => {
    const taskId = `t${Date.now()}`
    const textId = `b${Date.now() + 1}`
    setBlocks((prev) => {
      const last = prev[prev.length - 1]
      const taskBlock = { id: taskId, kind: 'task' as const, text: '', done: false }
      const trailingText = { id: textId, kind: 'text' as const, content: '' }
      // If last block is an empty text block, replace it with task + new empty text
      // Otherwise append at the end
      const next = last?.kind === 'text' && last.content === ''
        ? [...prev.slice(0, -1), taskBlock, trailingText]
        : [...prev, taskBlock, trailingText]
      patchNote({ blocks: next })
      return next
    })
    setFocusId(taskId)
  }

  const taskBlocks = blocks.filter((b) => b.kind === 'task') as Extract<NoteBlock, { kind: 'task' }>[]
  const doneCount = taskBlocks.filter((b) => b.done).length

  return (
    <article
      className="relative p-8 md:p-12 rounded-xl dog-ear"
      style={{ background: dc.bg, boxShadow: '0px 10px 40px rgba(56,56,53,0.08)' }}
    >
      <div className="dog-ear-fold" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-4 p-1.5 rounded-lg transition-colors cursor-pointer"
        style={{ color: dc.accent }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.07)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
        title="Cerrar"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>

      {/* Note Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
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
          {taskBlocks.length > 0 && (
            <p className="mt-2 text-sm font-medium" style={{ color: dc.accent }}>
              {doneCount} de {taskBlocks.length} tareas completadas
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

      {/* Unified block editor */}
      <div className="mb-4">
        {blocks.map((block) => {
          if (block.kind === 'text') {
            return (
              <textarea
                key={block.id}
                ref={(el) => { if (el) elRefs.current.set(block.id, el); else elRefs.current.delete(block.id) }}
                value={block.content}
                onChange={(e) => updateBlockLocal(block.id, { content: e.target.value })}
                onBlur={flushBlocks}
                onKeyDown={(e) => {
                  const el = e.target as HTMLTextAreaElement
                  if (e.key === 'Backspace' && block.content === '' && el.selectionStart === 0) {
                    e.preventDefault()
                    deleteBlockAndFocusPrev(block.id)
                  }
                }}
                rows={Math.max(1, (block.content.match(/\n/g) ?? []).length + 1)}
                className="w-full bg-transparent outline-none text-xl leading-relaxed font-medium resize-none block"
                style={{
                  color: dc.title,
                  fontFamily: 'Be Vietnam Pro, sans-serif',
                  marginBottom: '4px',
                }}
              />
            )
          }

          // task block
          return (
            <div key={block.id} className="flex items-center gap-3 group py-0.5">
              <div
                className="h-6 w-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: block.done ? dc.checkDone : dc.checkBorder,
                  background: block.done ? dc.checkDone : 'transparent',
                }}
                onClick={() => toggleTask(block.id)}
              >
                {block.done && (
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                )}
              </div>
              <input
                ref={(el) => { if (el) elRefs.current.set(block.id, el); else elRefs.current.delete(block.id) }}
                type="text"
                value={block.text}
                onChange={(e) => updateBlockLocal(block.id, { text: e.target.value })}
                onBlur={flushBlocks}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const newId = `t${Date.now()}`
                    const idx = blocks.findIndex((b) => b.id === block.id)
                    setBlocks((prev) => {
                      const next = [
                        ...prev.slice(0, idx + 1),
                        { id: newId, kind: 'task' as const, text: '', done: false },
                        ...prev.slice(idx + 1),
                      ]
                      patchNote({ blocks: next })
                      return next
                    })
                    setFocusId(newId)
                  }
                  if (e.key === 'Backspace' && block.text === '') {
                    e.preventDefault()
                    const textId = block.id
                    setBlocks((prev) => {
                      const next = prev.map((b) =>
                        b.id === textId ? { id: textId, kind: 'text' as const, content: '' } : b
                      )
                      patchNote({ blocks: next })
                      return next
                    })
                    setFocusId(textId)
                  }
                }}
                className="flex-1 bg-transparent outline-none text-xl font-medium"
                style={{
                  color: dc.title,
                  textDecoration: block.done ? 'line-through' : 'none',
                  opacity: block.done ? 0.6 : 1,
                  fontFamily: 'Be Vietnam Pro, sans-serif',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Add item button */}
      <div className="pb-6 mb-6 flex justify-end" style={{ borderBottom: `1px solid ${dc.border}` }}>
        <button
          onClick={addTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-all"
          style={{ color: dc.accent, background: 'rgba(0,0,0,0.06)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.11)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.06)')}
        >
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          Agregar item
        </button>
      </div>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          <div className="grid grid-cols-2 md:contents gap-x-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-bold" style={{ color: dc.accent }}>
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                <span className="text-sm">Creado {note.createdAt}</span>
              </div>
              <button
                onClick={() => setConfirming('archive')}
                className="flex items-center gap-2 px-0 py-2 rounded-lg transition-colors font-semibold cursor-pointer w-fit"
                style={{ color: dc.accent }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                <span className="material-symbols-outlined">archive</span>
                <span>Archivar</span>
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 italic" style={{ color: dc.accent, opacity: 0.7 }}>
                <span className="material-symbols-outlined text-lg">schedule</span>
                <span className="text-sm">Editado {note.editedAt}</span>
              </div>
              <button
                onClick={() => setConfirming('delete')}
                className="flex items-center gap-2 px-0 py-2 rounded-lg transition-colors font-semibold cursor-pointer w-fit"
                style={{ color: '#c0392b' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                <span className="material-symbols-outlined">delete</span>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        )}
      </footer>
    </article>
  )
}
