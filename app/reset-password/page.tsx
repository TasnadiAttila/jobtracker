'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/auth/reset-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)
    setMessage(data.message ?? 'Something went wrong')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1ECE3] px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-display)] font-semibold text-2xl text-[#1E2128] mb-1">
          Reset your password
        </h1>
        <p className="text-sm text-[#6B6459] mb-8">
          Enter your email address and we will send you a link to set a new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-[#1E2128] text-sm focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
            />
          </div>

          {message && (
            <p className="text-sm text-[#6F8F6A] border-l-2 border-[#6F8F6A] pl-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#161A21] py-2.5 text-sm font-medium text-[#F6F2EA] hover:bg-[#232833] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-[#6B6459] hover:text-[#1E2128] transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}