import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { Unauthorized } from './errors'

// Resolves the signed-in user from the Supabase session cookie.
// Throws ApiHttpError(401) if anonymous. Returns the user-scoped
// supabase client (for RLS-enforced reads) plus the auth user.
export async function requireUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw Unauthorized()
  return { supabase, user }
}
