import { z } from 'zod'

export const createJobSchema = z.object({
  title: z.string().min(1, { message: 'A pozíció neve kötelező' }),
  companyName: z.string().min(1, { message: 'A cég neve kötelező' }),
  description: z.string().min(1, { message: 'A leírás kötelező' }),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  url: z.string().url({ message: 'Érvénytelen URL' }).optional().or(z.literal('')),
  postedAt: z.string().optional(),
})

export type CreateJobInput = z.infer<typeof createJobSchema>