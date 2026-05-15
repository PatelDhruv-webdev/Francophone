import { createClient } from '@supabase/supabase-js'
import { serverEnv } from '@/lib/env'

// Service role client — bypasses RLS. SERVER-ONLY.
// Never import this in client components or files that could bundle to the browser.
// Used for: grading (read correct_answer), awarding XP, creating SRS cards.
export function createAdminClient() {
  const e = serverEnv()
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
