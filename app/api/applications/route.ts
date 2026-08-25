import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const statusSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const body = await request.json()
  const result = statusSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: 'Érvénytelen adat' }, { status: 400 })
  }

  const { jobId, status } = result.data

  const application = await prisma.application.upsert({
    where: {
      userId_jobId: { userId: session.user.id, jobId },
    },
    update: {
      status,
      ...(status === 'APPLIED' ? { appliedAt: new Date() } : {}),
    },
    create: {
      userId: session.user.id,
      jobId,
      status,
      ...(status === 'APPLIED' ? { appliedAt: new Date() } : {}),
    },
  })

  await prisma.statusHistory.create({
    data: { applicationId: application.id, status },
  })

  return NextResponse.json(application)
}