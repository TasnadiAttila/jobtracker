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
          setError('This email address is already registered')
        } else if (data.error?.email?.[0]) {
          setError(data.error.email[0])
        } else if (data.error?.password?.[0]) {
          setError(data.error.password[0])
        } else {
          setError('Something went wrong during registration')
        }

        return
      }

      setSuccess('Registration successful! You can now sign in.')
      setMode('login')
      setPassword('')
      return
    }

    // Sign in
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Incorrect email or password')
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="auth-shell">
      <section className="auth-intro" aria-label="About JobApplicationTracker">
        <div className="brand-lockup">
          <span className="brand-mark">J</span>
          <span>JobApplicationTracker</span>
        </div>

        <div className="intro-copy">
          <p className="eyebrow">Your job search, all in one place</p>
          <h1>Find your next great opportunity.</h1>
          <p className="intro-description">
            Track your applications, organize your tasks, and stay on top of every
            conversation.
          </p>
        </div>

        <div className="intro-footer">
          <span className="status-dot" />
          <span>Search smarter. Stay focused.</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="mobile-brand brand-lockup">
            <span className="brand-mark">J</span>
            <span>JobApplicationTracker</span>
          </div>

          <div className="form-heading">
            <p className="eyebrow">Welcome back</p>
            <h2>{mode === 'login' ? 'Good to see you.' : 'Let’s get started.'}</h2>
            <p>
              {mode === 'login'
                ? 'Sign in to your account to continue.'
                : 'Create your account in just a few moments.'}
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <label className="field-group">
              <span>Full name</span>
              <input type="text" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </label>
          )}

          <label className="field-group">
            <span>Email address</span>
            <input type="email" placeholder="anna@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : undefined} />
          </label>

          {error && <p className="form-message error-message">{error}</p>}
          {success && <p className="form-message success-message">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
              {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
            setSuccess(null)
          }}
          className="mode-toggle"
        >
          {mode === 'login'
            ? 'Don’t have an account? Create one'
            : 'Already have an account? Sign in'}
        </button>
        </div>
      </section>
    </main>
  )
}