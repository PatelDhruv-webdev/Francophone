import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

// Singleton browser client — safe to call from anywhere in client components
export function createClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
