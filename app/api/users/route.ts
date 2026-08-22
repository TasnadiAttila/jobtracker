import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true }, // Never return passwords
  })
  return NextResponse.json(users)
}