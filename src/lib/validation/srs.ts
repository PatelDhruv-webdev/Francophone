import { z } from 'zod'

export const dueQuery = z.object({
  limit: z
    .preprocess(
      (v) => (typeof v === 'string' ? parseInt(v, 10) : v),
      z.number().int().min(1).max(50),
    )
    .optional()
    .default(20),
})

export type DueQuery = z.infer<typeof dueQuery>

export const reviewBody = z.object({
  cardId: z.string().uuid(),
  quality: z.number().int().min(0).max(5),
})

export type ReviewBody = z.infer<typeof reviewBody>
