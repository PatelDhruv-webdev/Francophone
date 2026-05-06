'use client'

import { useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useUserStore()

  useEffect(() => {
    const supabase = createClient()

    async function loadSession() {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select(
            'id, username, display_name, avatar_url, current_level, xp, streak_days, last_active_at',
          )
          .eq('id', user.id)
          .single()

        setProfile(profile)
      }

      setLoading(false)
    }

    loadSession()

    // Keep session and profile in sync with auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select(
            'id, username, display_name, avatar_url, current_level, xp, streak_days, last_active_at',
          )
          .eq('id', session.user.id)
          .single()

        setProfile(profile)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading])

  return <AppShell>{children}</AppShell>
}
