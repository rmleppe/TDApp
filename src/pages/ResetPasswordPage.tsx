import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { confirmPasswordReset } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const oobCode = params.get('oobCode') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!oobCode) {
      setError('El link es inválido o ya expiró.')
      return
    }

    setSubmitting(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess(true)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
        setError('El link expiró o ya fue usado. Solicita uno nuevo.')
      } else if (code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.')
      } else {
        setError('Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#fefcf4' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-4 md:gap-6">
        {/* Logo */}
        <div className="text-center">
          <p
            className="text-2xl md:text-4xl font-black tracking-tighter"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#007257' }}
          >
            TDApp
          </p>
          <p className="mt-2 text-base" style={{ color: '#635f5a', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            Tus notas y tareas, siempre contigo.
          </p>
        </div>

        <div
          className="w-full rounded-2xl p-5 md:p-7 flex flex-col gap-5"
          style={{ background: '#f5f2ea', border: '1px solid #e8e5dd' }}
        >
          {success ? (
            <div className="flex flex-col items-center gap-4 py-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,114,87,0.12)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#007257" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center">
                <p
                  className="text-base font-extrabold"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#383833' }}
                >
                  ¡Contraseña actualizada!
                </p>
                <p className="mt-1 text-sm" style={{ color: '#82807c', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl font-semibold transition-all active:scale-95 cursor-pointer"
                style={{
                  background: '#007257',
                  color: '#ffffff',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                Ir a iniciar sesión
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p
                  className="text-base md:text-lg font-extrabold"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#383833' }}
                >
                  Nueva contraseña
                </p>
                <p className="mt-1 text-sm" style={{ color: '#82807c', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  Elige una contraseña segura para tu cuenta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e8e5dd',
                    color: '#383833',
                    fontFamily: 'Be Vietnam Pro, sans-serif',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#007257')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e8e5dd')}
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e8e5dd',
                    color: '#383833',
                    fontFamily: 'Be Vietnam Pro, sans-serif',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#007257')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e8e5dd')}
                />

                {error && (
                  <p className="text-xs text-center" style={{ color: '#c0392b', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                  style={{
                    background: '#007257',
                    color: '#ffffff',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {submitting ? '...' : 'Cambiar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
