import { z } from 'zod'

export const submitExerciseBody = z.object({
  exerciseId: z.string().uuid(),
  answer: z.union([z.number(), z.string(), z.array(z.string()), z.record(z.string(), z.number())]),
})

export type SubmitExerciseBody = z.infer<typeof submitExerciseBody>
