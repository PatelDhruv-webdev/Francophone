'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  darkMode: boolean
  soundEnabled: boolean
  volume: number
  autoPlayAudio: boolean
  setDarkMode: (value: boolean) => void
  toggleDarkMode: () => void
  setSoundEnabled: (value: boolean) => void
  setVolume: (value: number) => void
  setAutoPlayAudio: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      soundEnabled: true,
      volume: 0.8,
      autoPlayAudio: true,
      setDarkMode: (value) => set({ darkMode: value }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setSoundEnabled: (value) => set({ soundEnabled: value }),
      setVolume: (value) => set({ volume: value }),
      setAutoPlayAudio: (value) => set({ autoPlayAudio: value }),
    }),
    { name: 'francopath-settings' },
  ),
)
