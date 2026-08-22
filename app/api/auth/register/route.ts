import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password are required' }),
  name: z.string().min(1).optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = registerSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(result.data.password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email: result.data.email,
        password: hashedPassword,
        name: result.data.name ?? null,
      },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'This email address is already in use' },
        { status: 409 }
      )
    }
    throw error
  }
}