'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="border-bordeaux/30 text-bordeaux hover:bg-bordeaux-light w-full rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors sm:w-auto"
    >
      Se déconnecter
    </button>
  )
}
