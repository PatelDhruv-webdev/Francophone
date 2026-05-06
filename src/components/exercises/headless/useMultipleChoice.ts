'use client'

import { useState, useCallback } from 'react'

interface UseMultipleChoiceReturn {
  selected: number | null
  select: (index: number) => void
  reset: () => void
  answer: number | null
}

export function useMultipleChoice(): UseMultipleChoiceReturn {
  const [selected, setSelected] = useState<number | null>(null)

  const select = useCallback((index: number) => {
    setSelected(index)
  }, [])

  const reset = useCallback(() => setSelected(null), [])

  return { selected, select, reset, answer: selected }
}
