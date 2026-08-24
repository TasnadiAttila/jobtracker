import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'

const requestSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = requestSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email },
  })

  // Always return the same message to avoid revealing which emails exist.
  if (!user) {
    return NextResponse.json({
      message: 'If that email address is registered, we sent a password reset link.',
    })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const resetLink = `http://localhost:3000/reset-password/${token}`

  console.log('\n=== PASSWORD RESET LINK ===')
  console.log(`Email: ${user.email}`)
  console.log(`Link: ${resetLink}`)
  console.log('================================\n')

  return NextResponse.json({
    message: 'If that email address is registered, we sent a password reset link.',
  })
}