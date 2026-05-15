import { z } from 'zod'

export const submitWritingBody = z.object({
  content: z.string().min(1).max(5000),
  wordCount: z.number().int().min(1).max(2000),
})

export type SubmitWritingBody = z.infer<typeof submitWritingBody>
