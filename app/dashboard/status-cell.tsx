'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN' | null

const STATUS_STYLES: Record<Exclude<Status, null>, string> = {
  SAVED: 'bg-[#6B6459]/10 text-[#6B6459]',
  APPLIED: 'bg-[#DB9A3C]/15 text-[#B5792A]',
  INTERVIEW: 'bg-[#4C6B8A]/15 text-[#3A5570]',
  OFFER: 'bg-[#6F8F6A]/15 text-[#4F6B4B]',
  REJECTED: 'bg-[#BE5A46]/15 text-[#A24632]',
  WITHDRAWN: 'bg-[#8A8375]/15 text-[#6B6459]',
}

const STATUS_LABELS: Record<Exclude<Status, null>, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

export function StatusCell({ jobId, initialStatus }: { jobId: string; initialStatus: Status }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(initialStatus)
  const [isPending, startTransition] = useTransition()

  const handleChange = async (newStatus: Exclude<Status, null>) => {
    setStatus(newStatus)

    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, status: newStatus }),
    })

    startTransition(() => {
      router.refresh()
    })
  }

  if (!status) {
    return (
      <button
        onClick={() => handleChange('SAVED')}
        disabled={isPending}
        className="text-xs font-medium border border-[#DDD5C7] rounded-full px-3 py-1 text-[#6B6459] hover:bg-[#F6F2EA] transition-colors disabled:opacity-50"
      >
        + Track
      </button>
    )
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value as Exclude<Status, null>)}
      disabled={isPending}
      className={`text-xs font-medium rounded-full pl-3 pr-6 py-1 border-0 cursor-pointer appearance-none disabled:opacity-50 ${STATUS_STYLES[status]}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 3.5L5 6.5L8 3.5' stroke='%236B6459' stroke-width='1.3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
      }}
    >
      {(Object.keys(STATUS_LABELS) as Array<Exclude<Status, null>>).map((key) => (
        <option key={key} value={key}>
          {STATUS_LABELS[key]}
        </option>
      ))}
    </select>
  )
}