import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  jobId: z.string().uuid(),
  appliedAt: z.string().nullable(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const body = await request.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: 'Érvénytelen adat' }, { status: 400 })
  }

  const { jobId, appliedAt } = result.data

  const application = await prisma.application.findUnique({
    where: { userId_jobId: { userId: session.user.id, jobId } },
  })

  if (!application) {
    return NextResponse.json(
      { error: 'Ehhez a joghoz még nincs elindítva a követés' },
      { status: 400 }
    )
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { appliedAt: appliedAt ? new Date(appliedAt) : null },
  })

  return NextResponse.json(updated)
}