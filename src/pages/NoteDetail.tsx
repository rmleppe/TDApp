import { useParams, useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import { useNotes } from '../context/NotesContext'
import NoteDetailContent from '../components/NoteDetailContent'

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notes } = useNotes()

  const note = notes.find((n) => n.id === id)

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

  return (
    <div className="min-h-screen" style={{ background: '#fefcf4', color: '#383833' }}>
      <TopAppBar />

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2">
          <button
            onClick={() => navigate('/board')}
            className="flex items-center gap-2 transition-colors group cursor-pointer"
            style={{ color: '#635f5a' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#007257')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#635f5a')}
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="font-medium">Volver al tablero</span>
          </button>
        </div>

        <NoteDetailContent note={note} onClose={() => navigate('/board')} />
      </main>
    </div>
  )
}
