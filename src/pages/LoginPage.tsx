import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#fefcf4' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="text-center">
          <p
            className="text-5xl font-black tracking-tighter"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#007257' }}
          >
            TDApp
          </p>
          <p className="mt-2 text-base" style={{ color: '#635f5a', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            Tus notas y tareas, siempre contigo.
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-2xl p-8 flex flex-col gap-6"
          style={{ background: '#f5f2ea', border: '1px solid #e8e5dd' }}
        >
          <div className="text-center">
            <p
              className="text-xl font-extrabold"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#383833' }}
            >
              Iniciar sesión
            </p>
            <p className="mt-1 text-sm" style={{ color: '#82807c', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              Usa tu cuenta de Google para continuar
            </p>
          </div>

          <button
            onClick={login}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-xl font-semibold transition-all active:scale-95 cursor-pointer"
            style={{
              background: '#ffffff',
              color: '#383833',
              border: '1.5px solid #e8e5dd',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: '0 1px 4px rgba(56,56,53,0.08)',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(56,56,53,0.14)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(56,56,53,0.08)')}
          >
            {/* Google icon */}
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 16 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.6 7.9 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.5 36.1 26.9 37 24 37c-5.1 0-10.6-3.1-11.8-8.5l-7 5.4C8.6 41.1 15.7 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.6 2.8-2.3 5.2-4.7 6.9l6.6 5.4C41.6 37.5 45 31.3 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Entrar con Google
          </button>
        </div>
      </div>
    </div>
  )
}
