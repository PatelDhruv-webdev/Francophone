'use client'

import { useState, useCallback, useRef } from 'react'

export interface UseFlashCardReturn {
  side: 'front' | 'back'
  isFlipping: boolean
  flip: () => void
  reset: () => void
}

const FLIP_DURATION_MS = 150

export function useFlashCard(): UseFlashCardReturn {
  const [side, setSide] = useState<'front' | 'back'>('front')
  const [isFlipping, setIsFlipping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flip = useCallback(() => {
    if (isFlipping) return
    setIsFlipping(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSide((prev) => (prev === 'front' ? 'back' : 'front'))
      setIsFlipping(false)
    }, FLIP_DURATION_MS)
  }, [isFlipping])

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsFlipping(false)
    setSide('front')
  }, [])

  return { side, isFlipping, flip, reset }
}
