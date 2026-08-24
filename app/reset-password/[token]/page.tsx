'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ResetPasswordConfirmPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('The two passwords do not match')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1ECE3] px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-display)] font-semibold text-2xl text-[#1E2128] mb-1">
          Set a new password
        </h1>
        <p className="text-sm text-[#6B6459] mb-8">
          Enter your new password twice.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-[#1E2128] text-sm focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-[#1E2128] text-sm focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-[#BE5A46] border-l-2 border-[#BE5A46] pl-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#161A21] py-2.5 text-sm font-medium text-[#F6F2EA] hover:bg-[#232833] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  )
}