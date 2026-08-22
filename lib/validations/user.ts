import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Érvénytelen email cím' }),
  name: z.string().min(1).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>