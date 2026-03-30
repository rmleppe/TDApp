import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import { COLOR_MAP, DETAIL_COLORS, type Note } from '../data/notes'
import { useNotes } from '../context/NotesContext'

function ArchivedCard({ note, onUnarchive, onDelete }: {
  note: Note
  onUnarchive: () => void
  onDelete: () => void
}) {
  const c = COLOR_MAP[note.color]
  const dc = DETAIL_COLORS[note.color]
  const [confirming, setConfirming] = useState<'delete' | null>(null)

  return (
    <div className={`relative ${c.bg} p-4 md:p-5 rounded-xl dog-ear flex flex-col gap-3 min-h-[90px] md:min-h-[120px]`}
      style={{ opacity: 0.85 }}>
      <div className="dog-ear-fold" />

      <div className="flex justify-between items-start">
        <h3 className={`font-bold ${c.title} text-sm md:text-base`}
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {note.title}
        </h3>
        <span className={`material-symbols-outlined ${c.icon}`} style={{ fontSize: '22px' }}>
          {note.icon}
        </span>
      </div>

      <p className="text-xs" style={{ color: dc.accent, fontFamily: 'Be Vietnam Pro, sans-serif' }}>
        Archivada · Creada {note.createdAt}
      </p>

      <div className="mt-auto flex items-center gap-2 flex-wrap">
        {confirming === 'delete' ? (
          <>
            <span className="text-xs font-semibold" style={{ color: dc.accent, fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              ¿Eliminar?
            </span>
            <button
              onClick={onDelete}
              className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
              style={{ background: '#c0392b', color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirming(null)}
              className="px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.08)', color: dc.accent, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onUnarchive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.5)', color: dc.accent, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.8)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.5)')}
            >
              <span className="material-symbols-outlined text-[14px]">unarchive</span>
              Restaurar
            </button>
            <button
              onClick={() => setConfirming('delete')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              style={{ background: 'rgba(192,57,43,0.1)', color: '#c0392b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,57,43,0.2)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,57,43,0.1)')}
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ArchivePage() {
  const { notes, unarchiveNote, deleteNote } = useNotes()
  const archived = notes.filter((n) => n.archived)

  return (
    <div className="min-h-screen" style={{ background: '#fefcf4', color: '#383833' }}>
      <TopAppBar />

      <main className="max-w-screen-2xl mx-auto px-4 py-4 pb-20 md:px-6 md:py-6 md:pb-28">
        <header className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#383833' }}>
            Archivo
          </h1>
          <p className="mt-2 text-lg" style={{ color: '#635f5a' }}>
            {archived.length === 0
              ? 'No hay notas archivadas.'
              : `${archived.length} nota${archived.length !== 1 ? 's' : ''} archivada${archived.length !== 1 ? 's' : ''}.`}
          </p>
        </header>

        {archived.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {archived.map((note) => (
              <ArchivedCard
                key={note.id}
                note={note}
                onUnarchive={() => unarchiveNote(note.id)}
                onDelete={() => deleteNote(note.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
