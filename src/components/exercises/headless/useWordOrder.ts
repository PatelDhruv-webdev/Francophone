'use client'

import { useState, useCallback } from 'react'

interface UseWordOrderReturn {
  bank: string[] // tokens not yet placed
  placed: string[] // tokens in user's sentence (in order)
  addToken: (token: string, bankIndex: number) => void
  removeToken: (placedIndex: number) => void
  reset: (tokens: string[]) => void
  answer: string[]
}

// Shuffles an array (Fisher-Yates) — deterministic within a seed would be better
// but client-side shuffle on mount is fine for exercises
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function useWordOrder(initialTokens: string[]): UseWordOrderReturn {
  const [bank, setBank] = useState<string[]>(() => shuffle(initialTokens))
  const [placed, setPlaced] = useState<string[]>([])

  const addToken = useCallback((token: string, bankIndex: number) => {
    setBank((b) => b.filter((_, i) => i !== bankIndex))
    setPlaced((p) => [...p, token])
  }, [])

  const removeToken = useCallback((placedIndex: number) => {
    setPlaced((p) => {
      const token = p[placedIndex]
      if (token === undefined) return p
      setBank((b) => [...b, token])
      return p.filter((_, i) => i !== placedIndex)
    })
  }, [])

  const reset = useCallback((tokens: string[]) => {
    setBank(shuffle(tokens))
    setPlaced([])
  }, [])

  return { bank, placed, addToken, removeToken, reset, answer: placed }
}
