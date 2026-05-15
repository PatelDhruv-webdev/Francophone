import { z } from 'zod'

const intFromString = z.preprocess(
  (v) => (typeof v === 'string' && v !== '' ? parseInt(v, 10) : v),
  z.number().int(),
)

const boolFromString = z.preprocess((v) => {
  if (typeof v === 'string') return v === 'true' || v === '1'
  return v
}, z.boolean())

export const listVerbsQuery = z.object({
  level: z
    .string()
    .regex(/^[A-Ca-c][12]$/, { message: 'level must be A1, A2, B1, B2, C1 or C2' })
    .optional(),
  group: intFromString
    .refine((n) => n === 1 || n === 2 || n === 3, 'group must be 1, 2 or 3')
    .optional(),
  auxiliary: z.enum(['avoir', 'être']).optional(),
  irregular: boolFromString.optional(),
})

export type ListVerbsQuery = z.infer<typeof listVerbsQuery>

// Verb id schema — slug: lowercase letters, digits, underscores. Matches data pack ids
// like 'etre', 'avoir', 'aller', 'se_lever'.
export const verbIdSchema = z.string().regex(/^[a-z][a-z0-9_]*$/, 'invalid verb id')
