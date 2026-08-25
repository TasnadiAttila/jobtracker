import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createJobSchema } from '@/lib/validations/job'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const body = await request.json()
  const result = createJobSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { companyName, salaryMin, salaryMax, url, postedAt, ...jobData } = result.data

  // Meglévő cég keresése név alapján, vagy új létrehozása
  let company = await prisma.company.findFirst({
    where: { name: { equals: companyName, mode: 'insensitive' } },
  })

  if (!company) {
    company = await prisma.company.create({
      data: { name: companyName },
    })
  }

  const job = await prisma.job.create({
    data: {
      ...jobData,
      salaryMin: salaryMin ?? null,
      salaryMax: salaryMax ?? null,
      url: url || null,
      postedAt: postedAt ? new Date(postedAt) : null,
      companyId: company.id,
    },
  })

  return NextResponse.json(job, { status: 201 })
}