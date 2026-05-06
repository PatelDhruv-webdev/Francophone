'use client'

import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  current_level: string
  xp: number
  streak_days: number
  last_active_at: string | null
}

interface UserState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null, profile: null, isLoading: false }),
}))
