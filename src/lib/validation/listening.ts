import { z } from 'zod'

export const completeListeningBody = z.object({
  score: z.number().min(0).max(100),
})

export type CompleteListeningBody = z.infer<typeof completeListeningBody>
