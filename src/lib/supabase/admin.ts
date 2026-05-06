import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS. SERVER-ONLY.
// Never import this in client components or files that could bundle to the browser.
// Used for: grading (read correct_answer), awarding XP, creating SRS cards.
export function createAdminClient() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
