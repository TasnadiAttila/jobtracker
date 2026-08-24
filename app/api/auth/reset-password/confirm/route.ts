import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const confirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, { message: 'At least 8 characters are required' }),
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = confirmSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: result.data.token },
  })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'This link is invalid or has expired' },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(result.data.password, 10)

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  })

  // Remove the used token and all other tokens belonging to this user.
  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId },
  })

  return NextResponse.json({ message: 'Password changed successfully' })
}