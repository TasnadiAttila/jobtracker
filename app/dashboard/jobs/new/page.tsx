'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewJobPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [remote, setRemote] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [url, setUrl] = useState('')
  const [postedAt, setPostedAt] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        companyName,
        description,
        location: location || undefined,
        remote,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        url: url || undefined,
        postedAt: postedAt || undefined,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      const firstError =
        data.error?.title?.[0] ??
        data.error?.companyName?.[0] ??
        data.error?.description?.[0] ??
        data.error?.url?.[0] ??
        data.error ??
        'Hiba történt a mentés során'
      setError(typeof firstError === 'string' ? firstError : 'Hiba történt a mentés során')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F1ECE3] px-6 py-10 lg:px-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-[#6B6459] hover:text-[#1E2128] transition-colors"
        >
          ← Vissza a listához
        </Link>

        <h1 className="font-[family-name:var(--font-display)] font-semibold text-3xl text-[#1E2128] mt-4 mb-8">
          Új állás hozzáadása
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-[#E5DFD3] p-6 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
                Pozíció neve
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
                Cég neve
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
              Leírás
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
                Helyszín
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="pl. San Francisco, CA"
                className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-sm text-[#1E2128] placeholder:text-[#B5AEA0] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
              />
            </div>

            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 text-sm text-[#1E2128] cursor-pointer">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DDD5C7] text-[#DB9A3C] focus:ring-[#DB9A3C]/40"
                />
                Remote pozíció
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
                Fizetés min. ($)
              </label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                min={0}
                className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
                Fizetés max. ($)
              </label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                min={0}
                className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
                Hirdetés linkje
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-sm text-[#1E2128] placeholder:text-[#B5AEA0] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1.5">
                Kiírás dátuma
              </label>
              <input
                type="date"
                value={postedAt}
                onChange={(e) => setPostedAt(e.target.value)}
                className="w-full rounded-md border border-[#DDD5C7] bg-white px-3.5 py-2.5 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C] transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#BE5A46] border-l-2 border-[#BE5A46] pl-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#161A21] px-5 py-2.5 text-sm font-medium text-[#F6F2EA] hover:bg-[#232833] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Mentés…' : 'Állás mentése'}
            </button>
            <Link
              href="/dashboard"
              className="rounded-md border border-[#DDD5C7] px-5 py-2.5 text-sm text-[#1E2128] hover:bg-[#F6F2EA] transition-colors"
            >
              Mégse
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}