'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (mode === 'register') {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      setLoading(false)

      if (!res.ok) {
        const data = await res.json()

        if (res.status === 409) {
          setError('Ez az email cím már regisztrálva van')
        } else if (data.error?.email?.[0]) {
          setError(data.error.email[0])
        } else if (data.error?.password?.[0]) {
          setError(data.error.password[0])
        } else {
          setError('Hiba történt a regisztráció során')
        }

        return
      }

      setSuccess('Sikeres regisztráció! Most jelentkezz be.')
      setMode('login')
      setPassword('')
      return
    }

    // Bejelentkezés
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Hibás email vagy jelszó')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {mode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Név"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />

          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'register' ? 8 : undefined}
            className="w-full rounded border px-3 py-2"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
          >
            {loading
              ? 'Folyamatban...'
              : mode === 'login'
                ? 'Bejelentkezés'
                : 'Regisztráció'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
            setSuccess(null)
          }}
          className="mt-4 w-full text-center text-sm text-gray-600 hover:underline"
        >
          {mode === 'login'
            ? 'Nincs még fiókod? Regisztrálj'
            : 'Már van fiókod? Jelentkezz be'}
        </button>
      </div>
    </div>
  )
}