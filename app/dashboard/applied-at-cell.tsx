'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function AppliedAtCell({
  jobId,
  initialAppliedAt,
  tracked,
}: {
  jobId: string
  initialAppliedAt: string | null
  tracked: boolean
}) {
  const router = useRouter()
  const [value, setValue] = useState(initialAppliedAt ?? '')
  const [isPending, startTransition] = useTransition()

  if (!tracked) {
    return <span className="text-[#B5AEA0]">—</span>
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    await fetch('/api/applications/applied-at', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, appliedAt: newValue || null }),
    })

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <input
      type="date"
      value={value}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs rounded-md border border-[#DDD5C7] px-2 py-1.5 text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 disabled:opacity-50"
    />
  )
}